import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PlatformPromotion as PrismaPromotion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import type { PromotionResult } from './types';

type PromotionWithCity = PrismaPromotion & { city: { name: string } | null };

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PromotionResult[]> {
    const promotions = await this.prisma.platformPromotion.findMany({
      include: { city: { select: { name: true } } },
      orderBy: { startDate: 'desc' },
    });
    return promotions.map((promotion) => this.toResult(promotion));
  }

  async create(dto: CreatePromotionDto): Promise<PromotionResult> {
    if (dto.cityId) {
      await this.assertCityExists(dto.cityId);
    }
    this.assertDateRange(dto.startDate, dto.endDate);

    const promotion = await this.prisma.platformPromotion.create({
      data: {
        cityId: dto.cityId ?? null,
        name: dto.name,
        description: dto.description ?? null,
        pointsMultiplier: dto.pointsMultiplier,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        active: dto.active ?? true,
      },
      include: { city: { select: { name: true } } },
    });
    return this.toResult(promotion);
  }

  async update(id: string, dto: UpdatePromotionDto): Promise<PromotionResult> {
    const existing = await this.assertPromotion(id);

    if (dto.cityId) {
      await this.assertCityExists(dto.cityId);
    }
    if (dto.startDate || dto.endDate) {
      this.assertDateRange(dto.startDate ?? existing.startDate.toISOString(), dto.endDate ?? existing.endDate.toISOString());
    }

    const promotion = await this.prisma.platformPromotion.update({
      where: { id },
      data: {
        cityId: dto.cityId,
        name: dto.name,
        description: dto.description,
        pointsMultiplier: dto.pointsMultiplier,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        active: dto.active,
      },
      include: { city: { select: { name: true } } },
    });
    return this.toResult(promotion);
  }

  async remove(id: string): Promise<void> {
    await this.assertPromotion(id);
    await this.prisma.platformPromotion.delete({ where: { id } });
  }

  private async assertPromotion(id: string): Promise<PrismaPromotion> {
    const promotion = await this.prisma.platformPromotion.findUnique({ where: { id } });
    if (!promotion) {
      throw new NotFoundException('Promoción no encontrada');
    }
    return promotion;
  }

  private async assertCityExists(cityId: string): Promise<void> {
    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      throw new NotFoundException(`La ciudad ${cityId} no existe`);
    }
  }

  private assertDateRange(startDate: string, endDate: string): void {
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la de fin');
    }
  }

  private toResult(promotion: PromotionWithCity): PromotionResult {
    return {
      id: promotion.id,
      cityId: promotion.cityId,
      cityName: promotion.city?.name ?? null,
      name: promotion.name,
      description: promotion.description,
      pointsMultiplier: Number(promotion.pointsMultiplier),
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      active: promotion.active,
      createdAt: promotion.createdAt,
    };
  }
}
