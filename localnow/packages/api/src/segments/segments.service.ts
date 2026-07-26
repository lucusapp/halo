import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Segment as PrismaSegment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { parseSegmentRule, SegmentRule } from './rule-types';
import type { SegmentResult } from './types';

@Injectable()
export class SegmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SegmentResult[]> {
    const segments = await this.prisma.segment.findMany({ orderBy: { createdAt: 'desc' } });
    return segments.map((segment) => this.toResult(segment));
  }

  async create(dto: CreateSegmentDto): Promise<SegmentResult> {
    const city = await this.prisma.city.findUnique({ where: { id: dto.cityId } });
    if (!city) {
      throw new BadRequestException(`La ciudad ${dto.cityId} no existe`);
    }
    // Solo valida la forma — el segmento se crea sin miembros; hace falta un
    // recompute (§12: POST /admin/segments/recompute) para poblarlo.
    const rule = parseSegmentRule(dto.rules);

    const segment = await this.prisma.segment.create({
      data: {
        cityId: dto.cityId,
        name: dto.name,
        description: dto.description ?? null,
        rules: rule as unknown as Prisma.InputJsonValue,
      },
    });
    return this.toResult(segment);
  }

  // POST /admin/segments/recompute (§12): recalcula TODOS los segmentos activos.
  async recomputeAll(): Promise<SegmentResult[]> {
    const segments = await this.prisma.segment.findMany({ where: { active: true } });
    const results: SegmentResult[] = [];
    for (const segment of segments) {
      results.push(await this.recomputeOne(segment));
    }
    return results;
  }

  private async recomputeOne(segment: PrismaSegment): Promise<SegmentResult> {
    const rule = parseSegmentRule(segment.rules);
    const matchingUserIds = await this.evaluateRule(rule);

    // Desactiva las membresías que ya no cumplen la regla, y activa/crea las que sí.
    // No es una operación en una única transacción de BD: la membresía de un
    // segmento es informativa/analítica, no financiera — no hace falta la misma
    // atomicidad estricta que en puntos (§17.7); un recompute posterior autocorrige.
    await this.prisma.userSegment.updateMany({
      where: {
        segmentId: segment.id,
        active: true,
        userId: { notIn: matchingUserIds.length > 0 ? matchingUserIds : ['__none__'] },
      },
      data: { active: false },
    });

    for (const userId of matchingUserIds) {
      await this.prisma.userSegment.upsert({
        where: { userId_segmentId: { userId, segmentId: segment.id } },
        create: { userId, segmentId: segment.id, active: true },
        update: { active: true },
      });
    }

    const updated = await this.prisma.segment.update({
      where: { id: segment.id },
      data: { userCount: matchingUserIds.length, lastComputedAt: new Date() },
    });
    return this.toResult(updated);
  }

  private async evaluateRule(rule: SegmentRule): Promise<string[]> {
    switch (rule.type) {
      case 'MIN_AVG_SPEND': {
        const groups = await this.prisma.transaction.groupBy({
          by: ['userId'],
          where: {
            status: 'CONFIRMED',
            userId: { not: null },
            ...(rule.commerceId ? { commerceId: rule.commerceId } : {}),
          },
          _avg: { totalAmount: true },
          having: { totalAmount: { _avg: { gte: rule.minAmount } } },
        });
        return groups.map((g) => g.userId).filter((id): id is string => id !== null);
      }
      case 'MIN_PURCHASE_FREQUENCY': {
        const since = new Date(Date.now() - rule.withinDays * 24 * 60 * 60 * 1000);
        const groups = await this.prisma.transaction.groupBy({
          by: ['userId'],
          where: {
            status: 'CONFIRMED',
            userId: { not: null },
            timestamp: { gte: since },
            ...(rule.commerceId ? { commerceId: rule.commerceId } : {}),
          },
          _count: { _all: true },
          // `having` referencia el _count de un campo concreto (nunca nulo, así que
          // cuenta filas), no un `_all` a nivel superior como en el selector de arriba.
          having: { id: { _count: { gte: rule.minPurchases } } },
        });
        return groups.map((g) => g.userId).filter((id): id is string => id !== null);
      }
      case 'INACTIVE_SINCE': {
        const cutoff = new Date(Date.now() - rule.daysSinceLastPurchase * 24 * 60 * 60 * 1000);
        const groups = await this.prisma.transaction.groupBy({
          by: ['userId'],
          where: {
            status: 'CONFIRMED',
            userId: { not: null },
            ...(rule.commerceId ? { commerceId: rule.commerceId } : {}),
          },
          _max: { timestamp: true },
          having: { timestamp: { _max: { lt: cutoff } } },
        });
        return groups.map((g) => g.userId).filter((id): id is string => id !== null);
      }
    }
  }

  private toResult(segment: PrismaSegment): SegmentResult {
    return {
      id: segment.id,
      cityId: segment.cityId,
      name: segment.name,
      description: segment.description,
      rules: segment.rules as Record<string, unknown>,
      userCount: segment.userCount,
      lastComputedAt: segment.lastComputedAt,
      active: segment.active,
      createdAt: segment.createdAt,
    };
  }
}
