import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Coupon as PrismaCoupon,
  CouponStatus as PrismaCouponStatus,
  CouponType as PrismaCouponType,
} from '@prisma/client';
import { CouponStatus, CouponType } from '@localnow/shared';
import { PrismaService } from '../prisma/prisma.service';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { QrService } from '../qr/qr.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import type { AdminCouponResult, CouponActivationResult, CouponResult, UserActiveCouponResult } from './types';

@Injectable()
export class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qrService: QrService,
  ) {}

  async findByCommercePanel(commerceAuthId: string): Promise<CouponResult[]> {
    const commerce = await this.assertCommerce(commerceAuthId);
    const coupons = await this.prisma.coupon.findMany({
      where: { commerceId: commerce.id },
      orderBy: { createdAt: 'desc' },
    });
    return coupons.map((coupon) => this.toResult(coupon));
  }

  // GET /commerce/:id/coupons (§12): solo cupones publicados y vigentes.
  async findPublicByCommerce(commerceId: string): Promise<CouponResult[]> {
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({
      where: { commerceId, status: 'ACTIVE', startDate: { lte: now }, endDate: { gte: now } },
      orderBy: { createdAt: 'desc' },
    });
    return coupons.map((coupon) => this.toResult(coupon));
  }

  // GET /admin/coupons/pending (§5.3, §9.1): moderación, todos los comercios.
  async findPending(): Promise<AdminCouponResult[]> {
    const coupons = await this.prisma.coupon.findMany({
      where: { status: 'PENDING' },
      include: { commerce: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return coupons.map((coupon) => ({ ...this.toResult(coupon), commerceName: coupon.commerce.name }));
  }

  // Queda pendiente de moderación (§5.3 pasos 1-2) — nunca se publica directamente.
  async create(commerceAuthId: string, dto: CreateCouponDto): Promise<CouponResult> {
    const commerce = await this.assertCommerce(commerceAuthId);
    this.assertDateRange(dto.startDate, dto.endDate);

    const coupon = await this.prisma.coupon.create({
      data: {
        commerceId: commerce.id,
        title: dto.title,
        description: dto.description ?? null,
        type: mirrorEnum<PrismaCouponType>(dto.type),
        value: dto.value,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        maxRedemptions: dto.maxRedemptions,
        status: 'PENDING',
      },
    });
    return this.toResult(coupon);
  }

  async update(id: string, commerceAuthId: string, dto: UpdateCouponDto): Promise<CouponResult> {
    const coupon = await this.findOwned(id, commerceAuthId);

    if (dto.startDate || dto.endDate) {
      this.assertDateRange(dto.startDate ?? coupon.startDate.toISOString(), dto.endDate ?? coupon.endDate.toISOString());
    }

    const updated = await this.prisma.coupon.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type ? mirrorEnum<PrismaCouponType>(dto.type) : undefined,
        value: dto.value,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        maxRedemptions: dto.maxRedemptions,
        status: dto.status ? mirrorEnum<PrismaCouponStatus>(dto.status) : undefined,
      },
    });
    return this.toResult(updated);
  }

  async remove(id: string, commerceAuthId: string): Promise<void> {
    const coupon = await this.findOwned(id, commerceAuthId);
    if (coupon.currentRedemptions > 0) {
      throw new ConflictException(
        'Este cupón ya tiene canjes registrados y no se puede borrar — archívalo (status EXPIRED) en su lugar',
      );
    }
    await this.prisma.coupon.delete({ where: { id } });
  }

  // Listo para el futuro módulo Admin (§9.1) — sin endpoint propio todavía, igual que
  // CommerceService.approve.
  async approve(id: string): Promise<CouponResult> {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Cupón no encontrado');
    }
    const updated = await this.prisma.coupon.update({ where: { id }, data: { status: 'ACTIVE' } });
    return this.toResult(updated);
  }

  async getUserActiveCoupons(userAuthId: string): Promise<UserActiveCouponResult[]> {
    const user = await this.prisma.user.findUnique({ where: { authId: userAuthId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const redemptions = await this.prisma.couponRedemption.findMany({
      where: { userId: user.id, status: 'PENDING', qrExpiresAt: { gt: new Date() } },
      include: { coupon: true },
      orderBy: { createdAt: 'desc' },
    });
    return redemptions.map((redemption) => ({
      redemptionId: redemption.id,
      qrToken: redemption.qrToken,
      qrExpiresAt: redemption.qrExpiresAt,
      coupon: this.toResult(redemption.coupon),
    }));
  }

  // §5.3 paso 4: el usuario activa un cupón publicado y recibe un QR de un solo uso.
  async activate(userAuthId: string, couponId: string): Promise<CouponActivationResult> {
    const user = await this.prisma.user.findUnique({ where: { authId: userAuthId } });
    if (!user) {
      throw new BadRequestException('Regístrate en LocalNow antes de activar un cupón');
    }

    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon || coupon.status !== 'ACTIVE') {
      throw new NotFoundException('Cupón no encontrado');
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new BadRequestException('Este cupón no está vigente actualmente');
    }
    // Chequeo informativo — el definitivo y atómico es el de QrService al canjearlo
    // (evita sobrevender stock si varios usuarios activan casi a la vez).
    if (coupon.currentRedemptions >= coupon.maxRedemptions) {
      throw new BadRequestException('Este cupón ha agotado su stock de canjes');
    }

    const existing = await this.prisma.couponRedemption.findFirst({
      where: { couponId, userId: user.id, status: 'PENDING', qrExpiresAt: { gt: now } },
    });
    if (existing) {
      throw new ConflictException('Ya tienes un QR activo para este cupón — enséñalo en el comercio antes de que caduque');
    }

    const qrToken = this.qrService.generateToken();
    const qrExpiresAt = await this.qrService.computeExpiry();

    const redemption = await this.prisma.couponRedemption.create({
      data: { couponId, userId: user.id, qrToken, qrExpiresAt, status: 'PENDING' },
    });

    return {
      redemptionId: redemption.id,
      qrToken,
      qrExpiresAt,
      couponId: coupon.id,
      couponTitle: coupon.title,
    };
  }

  private async assertCommerce(commerceAuthId: string) {
    const commerce = await this.prisma.commerce.findUnique({ where: { authId: commerceAuthId } });
    if (!commerce) {
      throw new ForbiddenException('Esta cuenta no está registrada como comercio');
    }
    return commerce;
  }

  private async findOwned(id: string, commerceAuthId: string): Promise<PrismaCoupon> {
    const coupon = await this.prisma.coupon.findUnique({ where: { id }, include: { commerce: true } });
    if (!coupon) {
      throw new NotFoundException('Cupón no encontrado');
    }
    if (coupon.commerce.authId !== commerceAuthId) {
      throw new ForbiddenException('No puedes gestionar el cupón de otro comercio');
    }
    return coupon;
  }

  private assertDateRange(startDate: string, endDate: string): void {
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la de caducidad');
    }
  }

  private toResult(coupon: PrismaCoupon): CouponResult {
    return {
      id: coupon.id,
      commerceId: coupon.commerceId,
      title: coupon.title,
      description: coupon.description,
      type: mirrorEnum<CouponType>(coupon.type),
      value: Number(coupon.value),
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      maxRedemptions: coupon.maxRedemptions,
      currentRedemptions: coupon.currentRedemptions,
      status: mirrorEnum<CouponStatus>(coupon.status),
      createdAt: coupon.createdAt,
    };
  }
}
