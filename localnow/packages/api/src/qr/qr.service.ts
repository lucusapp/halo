import { randomUUID } from 'node:crypto';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CouponRedemption, RewardRedemption, Transaction as PrismaTransaction } from '@prisma/client';
import { QR_EXPIRY_MINUTES } from '@localnow/shared';
import { PointsService } from '../points/points.service';
import { PrismaService } from '../prisma/prisma.service';
import type { QrValidationResult } from './types';

type CouponRedemptionWithCoupon = CouponRedemption & {
  coupon: { commerceId: string; id: string; title: string; maxRedemptions: number };
};

// Pieza compartida de validación de QR de un solo uso (§6.6, §17.4): mismo orden de
// verificación en todos los flujos — existencia → PENDING → no expirado → comercio
// correcto. Transactions, Coupons y Rewards NO tienen una tabla de tokens unificada
// (cada uno tiene su propio qrToken/qrExpiresAt/status en su propio modelo, con
// enums de estado distintos: TransactionStatus vs RedemptionStatus) — así que este
// servicio expone un método por tipo de recurso en vez de un único "validate(token)"
// genérico, pero centraliza aquí la generación del token y el orden de comprobación.
@Injectable()
export class QrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
  ) {}

  generateToken(): string {
    return randomUUID();
  }

  computeExpiry(minutes: number = QR_EXPIRY_MINUTES): Date {
    return new Date(Date.now() + minutes * 60_000);
  }

  // Usado por TransactionsService.confirmSale — el cliente escanea el QR que muestra
  // el comercio (dirección inversa a coupon/reward, donde el comercio escanea el QR
  // del cliente). Por eso vive en un método propio y no en validateAndRedeem.
  async validateTransactionQr(qrToken: string): Promise<PrismaTransaction> {
    const transaction = await this.prisma.transaction.findUnique({ where: { qrToken } });
    if (!transaction) {
      throw new NotFoundException('QR no válido');
    }
    if (transaction.status !== 'PENDING') {
      throw new BadRequestException('Este ticket ya no está disponible para confirmar');
    }
    if (!transaction.qrExpiresAt || transaction.qrExpiresAt < new Date()) {
      throw new BadRequestException('El QR ha caducado');
    }
    return transaction;
  }

  // POST /qr/validate (§12): la app del COMERCIO escanea un QR que le enseña el
  // cliente (cupón activado o recompensa canjeada — §13.2). Un token es un UUID v4
  // aleatorio único entre ambas tablas, así que basta con mirar en las dos.
  async validateAndRedeem(commerceAuthId: string, token: string): Promise<QrValidationResult> {
    const commerce = await this.prisma.commerce.findUnique({ where: { authId: commerceAuthId } });
    if (!commerce) {
      throw new ForbiddenException('Esta cuenta no está registrada como comercio');
    }
    const commerceId = commerce.id;

    const couponRedemption = await this.prisma.couponRedemption.findUnique({
      where: { qrToken: token },
      include: { coupon: { select: { commerceId: true, id: true, title: true, maxRedemptions: true } } },
    });
    if (couponRedemption) {
      return this.redeemCoupon(couponRedemption, commerceId);
    }

    const rewardRedemption = await this.prisma.rewardRedemption.findUnique({ where: { qrToken: token } });
    if (rewardRedemption) {
      return this.redeemReward(rewardRedemption, commerceId);
    }

    throw new NotFoundException('QR no válido');
  }

  private async redeemCoupon(redemption: CouponRedemptionWithCoupon, commerceId: string): Promise<QrValidationResult> {
    this.assertPendingAndNotExpired(redemption);
    if (redemption.coupon.commerceId !== commerceId) {
      throw new ForbiddenException('Este cupón no pertenece a tu comercio');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Stock del cupón: incremento condicional a currentRedemptions < maxRedemptions
      // para no sobrepasar el stock si varios canjes llegan casi a la vez (§5.3:
      // "Stock máximo de canjes"). El chequeo "informativo" ya se hizo al activar el
      // cupón (CouponsService.activate); este es el atómico y definitivo.
      const stockUpdate = await tx.coupon.updateMany({
        where: { id: redemption.couponId, currentRedemptions: { lt: redemption.coupon.maxRedemptions } },
        data: { currentRedemptions: { increment: 1 } },
      });
      if (stockUpdate.count === 0) {
        throw new BadRequestException('Este cupón ya ha agotado su stock de canjes');
      }

      return tx.couponRedemption.update({
        where: { id: redemption.id },
        data: { status: 'USED', redeemedAt: new Date() },
      });
    });

    return {
      valid: true,
      type: 'coupon',
      detail: {
        redemptionId: updated.id,
        couponId: redemption.couponId,
        couponTitle: redemption.coupon.title,
        userId: redemption.userId,
      },
    };
  }

  private async redeemReward(redemption: RewardRedemption, commerceId: string): Promise<QrValidationResult> {
    this.assertPendingAndNotExpired(redemption);
    if (redemption.commerceId !== commerceId) {
      throw new ForbiddenException('Esta recompensa no pertenece a tu comercio');
    }

    const reward = await this.prisma.reward.findUniqueOrThrow({ where: { id: redemption.rewardId } });

    const updated = await this.prisma.$transaction(async (tx) => {
      // Los puntos se verifican y descuentan AQUÍ, no al generar el QR (§6.5 paso 4:
      // "el comercio lo escanea → la plataforma valida, descuenta puntos..."). Si el
      // saldo cambió entre el canje y el escaneo (ej. ya se gastó en otra recompensa),
      // se rechaza en vez de dejar el saldo en negativo.
      await this.pointsService.debitReward(tx, {
        userId: redemption.userId,
        commerceId: reward.commerceId,
        points: redemption.pointsDeducted,
      });

      return tx.rewardRedemption.update({
        where: { id: redemption.id },
        data: { status: 'USED', redeemedAt: new Date() },
      });
    });

    return {
      valid: true,
      type: 'reward',
      detail: {
        redemptionId: updated.id,
        rewardId: redemption.rewardId,
        rewardTitle: reward.title,
        userId: redemption.userId,
        pointsDeducted: redemption.pointsDeducted,
      },
    };
  }

  private assertPendingAndNotExpired(redemption: { status: string; qrExpiresAt: Date }): void {
    if (redemption.status !== 'PENDING') {
      throw new BadRequestException('Este QR ya no es válido (usado o caducado)');
    }
    if (redemption.qrExpiresAt < new Date()) {
      throw new BadRequestException('El QR ha caducado');
    }
  }
}
