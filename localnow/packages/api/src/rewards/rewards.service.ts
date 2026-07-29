import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RewardType } from '@localnow/shared';
import { PrismaService } from '../prisma/prisma.service';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { QrService } from '../qr/qr.service';
import { RedeemRewardDto } from './dto/redeem-reward.dto';
import type { AvailableRewardResult, RewardRedemptionResult } from './types';

@Injectable()
export class RewardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qrService: QrService,
  ) {}

  // GET /user/rewards/available (§6.5): ordenadas por coste, marcando cuáles están
  // bloqueadas y cuántos puntos faltan según el saldo real del usuario.
  async getAvailable(userAuthId: string): Promise<AvailableRewardResult[]> {
    const user = await this.prisma.user.findUnique({
      where: { authId: userAuthId },
      include: { pointsGlobal: true, pointsCommerce: true },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const rewards = await this.prisma.reward.findMany({
      where: { active: true },
      orderBy: { pointsCost: 'asc' },
    });

    const commerceBalances = new Map(user.pointsCommerce.map((entry) => [entry.commerceId, entry.balance]));
    const globalBalance = user.pointsGlobal?.balance ?? 0;

    return rewards.map((reward) => {
      const balance = reward.commerceId ? commerceBalances.get(reward.commerceId) ?? 0 : globalBalance;
      const locked = balance < reward.pointsCost;
      return {
        id: reward.id,
        commerceId: reward.commerceId,
        title: reward.title,
        description: reward.description,
        pointsCost: reward.pointsCost,
        valueEuros: reward.valueEuros ? Number(reward.valueEuros) : null,
        type: mirrorEnum<RewardType>(reward.type),
        locked,
        pointsMissing: locked ? reward.pointsCost - balance : 0,
      };
    });
  }

  // §6.5 pasos 1-3: genera el QR sin descontar puntos todavía — el descuento ocurre
  // al canjearlo de verdad (QrService.redeemReward, paso 4), no aquí.
  async redeem(userAuthId: string, rewardId: string, dto: RedeemRewardDto): Promise<RewardRedemptionResult> {
    const user = await this.prisma.user.findUnique({
      where: { authId: userAuthId },
      include: { pointsGlobal: true },
    });
    if (!user) {
      throw new BadRequestException('Regístrate en LocalNow antes de canjear una recompensa');
    }

    const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward || !reward.active) {
      throw new NotFoundException('Recompensa no encontrada');
    }

    // Las recompensas globales (commerceId null) no tienen un comercio fijo donde
    // canjearse — el usuario elige uno adherido en el momento de canjear.
    let commerceId: string;
    if (reward.commerceId) {
      commerceId = reward.commerceId;
    } else {
      if (!dto.commerceId) {
        throw new BadRequestException('Indica en qué comercio vas a canjear esta recompensa global');
      }
      const commerce = await this.prisma.commerce.findUnique({ where: { id: dto.commerceId } });
      if (!commerce || !commerce.active) {
        throw new BadRequestException('El comercio indicado no existe o no está activo');
      }
      commerceId = commerce.id;
    }

    const balance = reward.commerceId
      ? ((
          await this.prisma.userPointsCommerce.findUnique({
            where: { userId_commerceId: { userId: user.id, commerceId: reward.commerceId } },
          })
        )?.balance ?? 0)
      : (user.pointsGlobal?.balance ?? 0);

    if (balance < reward.pointsCost) {
      throw new BadRequestException('No tienes suficientes puntos para esta recompensa');
    }

    const existing = await this.prisma.rewardRedemption.findFirst({
      where: { rewardId, userId: user.id, status: 'PENDING', qrExpiresAt: { gt: new Date() } },
    });
    if (existing) {
      throw new ConflictException(
        'Ya tienes un QR activo para esta recompensa — enséñalo en el comercio antes de que caduque',
      );
    }

    const qrToken = this.qrService.generateToken();
    const qrExpiresAt = await this.qrService.computeExpiry();

    const redemption = await this.prisma.rewardRedemption.create({
      data: {
        rewardId,
        userId: user.id,
        commerceId,
        qrToken,
        qrExpiresAt,
        status: 'PENDING',
        pointsDeducted: reward.pointsCost,
      },
    });

    return {
      redemptionId: redemption.id,
      qrToken,
      qrExpiresAt,
      rewardId: reward.id,
      rewardTitle: reward.title,
      pointsDeducted: reward.pointsCost,
    };
  }
}
