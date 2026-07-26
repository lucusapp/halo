import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UserPointsResult } from './types';

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPoints(userAuthId: string): Promise<UserPointsResult> {
    const user = await this.prisma.user.findUnique({
      where: { authId: userAuthId },
      include: {
        pointsGlobal: true,
        pointsCommerce: { include: { commerce: { select: { id: true, name: true, slug: true } } } },
      },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      global: {
        balance: user.pointsGlobal?.balance ?? 0,
        totalEarned: user.pointsGlobal?.totalEarned ?? 0,
        totalRedeemed: user.pointsGlobal?.totalRedeemed ?? 0,
      },
      commerces: user.pointsCommerce.map((entry) => ({
        commerceId: entry.commerce.id,
        commerceName: entry.commerce.name,
        commerceSlug: entry.commerce.slug,
        balance: entry.balance,
        totalEarned: entry.totalEarned,
        totalRedeemed: entry.totalRedeemed,
      })),
    };
  }

  // Acredita puntos por una compra confirmada (§6.2, §6.4, §13.1 paso 8-9). Recibe el
  // cliente transaccional del llamador (tx) — nunca this.prisma — para que la
  // actualización de puntos y el cambio de estado de la venta se confirmen o se
  // deshagan juntos (§17.7: ambas capas se actualizan en la misma transacción de BD).
  async creditPurchasePoints(
    tx: Prisma.TransactionClient,
    params: {
      userId: string;
      commerceId: string;
      totalAmount: number;
      pointsRatioGlobal: number;
      commercePointsRatio: number;
    },
  ): Promise<{ pointsGlobalEarned: number; pointsCommerceEarned: number }> {
    const pointsGlobalEarned = Math.round(params.totalAmount * params.pointsRatioGlobal);
    const pointsCommerceEarned = Math.round(params.totalAmount * params.commercePointsRatio);

    await tx.userPointsGlobal.update({
      where: { userId: params.userId },
      data: {
        balance: { increment: pointsGlobalEarned },
        totalEarned: { increment: pointsGlobalEarned },
      },
    });

    await tx.userPointsCommerce.upsert({
      where: { userId_commerceId: { userId: params.userId, commerceId: params.commerceId } },
      create: {
        userId: params.userId,
        commerceId: params.commerceId,
        balance: pointsCommerceEarned,
        totalEarned: pointsCommerceEarned,
      },
      update: {
        balance: { increment: pointsCommerceEarned },
        totalEarned: { increment: pointsCommerceEarned },
      },
    });

    return { pointsGlobalEarned, pointsCommerceEarned };
  }

  // Descuenta puntos al canjear una recompensa (§6.5 paso 4, §17.7). El WHERE con
  // balance >= points hace que la comprobación de saldo suficiente y el descuento
  // sean UNA sola operación atómica — evita que dos canjes concurrentes dejen el
  // saldo en negativo (nunca "leer saldo, comprobar, luego restar" por separado).
  // commerceId null = recompensa global, se paga con el saldo LocalNow.
  async debitReward(
    tx: Prisma.TransactionClient,
    params: { userId: string; commerceId: string | null; points: number },
  ): Promise<void> {
    if (params.commerceId === null) {
      const result = await tx.userPointsGlobal.updateMany({
        where: { userId: params.userId, balance: { gte: params.points } },
        data: { balance: { decrement: params.points }, totalRedeemed: { increment: params.points } },
      });
      if (result.count === 0) {
        throw new BadRequestException('El usuario ya no tiene suficientes puntos globales para esta recompensa');
      }
      return;
    }

    const result = await tx.userPointsCommerce.updateMany({
      where: { userId: params.userId, commerceId: params.commerceId, balance: { gte: params.points } },
      data: { balance: { decrement: params.points }, totalRedeemed: { increment: params.points } },
    });
    if (result.count === 0) {
      throw new BadRequestException('El usuario ya no tiene suficientes puntos en este comercio para esta recompensa');
    }
  }
}
