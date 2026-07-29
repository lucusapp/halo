import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Commerce as PrismaCommerce, CommerceCategory as PrismaCommerceCategory, Prisma } from '@prisma/client';
import type { CommerceCategory, CommerceSchedule, SubscriptionPlan, SubscriptionStatus } from '@localnow/shared';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommerceDto } from './dto/create-commerce.dto';
import { FindCommerceQueryDto } from './dto/find-commerce-query.dto';
import { UpdateCommerceDto } from './dto/update-commerce.dto';
import type { AdminCommerceResult, OwnCommerceResult, PublicCommerceResult } from './types';

@Injectable()
export class CommerceService {
  constructor(private readonly prisma: PrismaService) {}

  // Directorio público (§5, §12): solo comercios ya aprobados y publicados.
  async findAll(query: FindCommerceQueryDto): Promise<PublicCommerceResult[]> {
    const commerces = await this.prisma.commerce.findMany({
      where: {
        active: true,
        ...(query.city ? { city: { slug: query.city } } : {}),
        ...(query.category ? { category: mirrorEnum<PrismaCommerceCategory>(query.category) } : {}),
      },
      orderBy: { name: 'asc' },
    });
    return commerces.map((commerce) => this.toPublicResult(commerce));
  }

  async findOne(id: string): Promise<PublicCommerceResult> {
    const commerce = await this.prisma.commerce.findUnique({ where: { id } });
    // Mismo 404 si no existe o si aún no está activo: no revelamos altas pendientes
    // de revisión a través del perfil público (§9.1).
    if (!commerce || !commerce.active) {
      throw new NotFoundException('Comercio no encontrado');
    }
    return this.toPublicResult(commerce);
  }

  // GET /admin/commerce/pending (§12, vía AdminService.getCommercesPending) — altas
  // a la espera de revisión manual (§9.1). Vista de dueño (OwnCommerceResult): quien
  // modera necesita ver el CIF, no solo lo que vería el público.
  async findPending(): Promise<OwnCommerceResult[]> {
    const commerces = await this.prisma.commerce.findMany({
      where: { active: false },
      orderBy: { createdAt: 'asc' },
    });
    return commerces.map((commerce) => this.toOwnResult(commerce));
  }

  // GET /admin/commerce: todos los comercios (pendientes y ya aprobados), con el
  // estado de suscripción que solo interesa a moderación — pendientes primero para
  // que el panel los destaque arriba sin que el frontend tenga que combinar dos
  // llamadas.
  async findAllForAdmin(): Promise<AdminCommerceResult[]> {
    const commerces = await this.prisma.commerce.findMany({
      orderBy: [{ active: 'asc' }, { createdAt: 'desc' }],
    });
    return commerces.map((commerce) => this.toAdminResult(commerce));
  }

  async create(authId: string, dto: CreateCommerceDto): Promise<PrismaCommerce> {
    const existing = await this.prisma.commerce.findUnique({ where: { authId } });
    if (existing) {
      throw new ConflictException('Ya existe un comercio registrado con esta cuenta');
    }

    await this.assertCityExists(dto.cityId);

    const slug = await this.generateUniqueSlug(dto.name);

    try {
      return await this.prisma.commerce.create({
        data: {
          authId,
          name: dto.name,
          slug,
          cityId: dto.cityId,
          category: mirrorEnum<PrismaCommerceCategory>(dto.category),
          cif: dto.cif,
          address: dto.address,
          lat: dto.lat ?? null,
          lng: dto.lng ?? null,
          phone: dto.phone ?? null,
          email: dto.email,
          logoUrl: dto.logoUrl ?? null,
          description: dto.description ?? null,
          schedule: dto.schedule,
          // El alta queda pendiente de revisión manual (§9.1) — nunca se activa/verifica
          // en el registro, sin importar lo que llegue en el body.
          active: false,
          verified: false,
        },
      });
    } catch (error) {
      this.handleUniqueConstraintError(error, 'comercio');
    }
  }

  // "Solo el propio comercio" — se compara el authId del JWT contra el dueño real de
  // la fila, nunca se confía en el :id de la URL por sí solo.
  async update(id: string, authId: string, dto: UpdateCommerceDto): Promise<PrismaCommerce> {
    const commerce = await this.prisma.commerce.findUnique({ where: { id } });
    if (!commerce) {
      throw new NotFoundException('Comercio no encontrado');
    }
    if (commerce.authId !== authId) {
      throw new ForbiddenException('No puedes editar el perfil de otro comercio');
    }

    try {
      return await this.prisma.commerce.update({
        where: { id },
        data: {
          name: dto.name,
          category: dto.category ? mirrorEnum<PrismaCommerceCategory>(dto.category) : undefined,
          address: dto.address,
          lat: dto.lat,
          lng: dto.lng,
          phone: dto.phone,
          email: dto.email,
          logoUrl: dto.logoUrl,
          description: dto.description,
          schedule: dto.schedule,
        },
      });
    } catch (error) {
      this.handleUniqueConstraintError(error, 'comercio');
    }
  }

  // Aprobación de alta (§9.1, §12: PUT /admin/commerce/:id/approve). El endpoint vive
  // en el módulo Admin, no aquí — este método queda listo para que Admin lo llame.
  async approve(id: string): Promise<PrismaCommerce> {
    const commerce = await this.prisma.commerce.findUnique({ where: { id } });
    if (!commerce) {
      throw new NotFoundException('Comercio no encontrado');
    }
    return this.prisma.commerce.update({
      where: { id },
      data: { verified: true, active: true },
    });
  }

  private async assertCityExists(cityId: string): Promise<void> {
    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      throw new NotFoundException(`La ciudad ${cityId} no existe`);
    }
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);

    const maxAttempts = 20;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      const collision = await this.prisma.commerce.findUnique({ where: { slug: candidate } });
      if (!collision) {
        return candidate;
      }
    }
    throw new ConflictException('No se pudo generar un slug único para el comercio, inténtalo con otro nombre');
  }

  private handleUniqueConstraintError(error: unknown, entity: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = error.meta?.target;
      const fields = Array.isArray(target) ? target.join(', ') : 'un campo único';
      throw new ConflictException(`Ya existe un ${entity} con ese valor en: ${fields}`);
    }
    throw error;
  }

  private toSchedule(value: Prisma.JsonValue | null): CommerceSchedule | null {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as CommerceSchedule;
    }
    return null;
  }

  private toPublicResult(commerce: PrismaCommerce): PublicCommerceResult {
    return {
      id: commerce.id,
      name: commerce.name,
      slug: commerce.slug,
      cityId: commerce.cityId,
      category: mirrorEnum<CommerceCategory>(commerce.category),
      address: commerce.address,
      lat: commerce.lat,
      lng: commerce.lng,
      phone: commerce.phone,
      email: commerce.email,
      logoUrl: commerce.logoUrl,
      description: commerce.description,
      schedule: this.toSchedule(commerce.schedule),
      createdAt: commerce.createdAt,
    };
  }

  toOwnResult(commerce: PrismaCommerce): OwnCommerceResult {
    return {
      ...this.toPublicResult(commerce),
      cif: commerce.cif,
      verified: commerce.verified,
      active: commerce.active,
    };
  }

  private toAdminResult(commerce: PrismaCommerce): AdminCommerceResult {
    return {
      ...this.toOwnResult(commerce),
      subscriptionStatus: mirrorEnum<SubscriptionStatus>(commerce.subscriptionStatus),
      subscriptionPlan: commerce.subscriptionPlan ? mirrorEnum<SubscriptionPlan>(commerce.subscriptionPlan) : null,
    };
  }
}
