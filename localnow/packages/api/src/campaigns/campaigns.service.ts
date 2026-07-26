import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Campaign as PrismaCampaign,
  CampaignType as PrismaCampaignType,
  IncentiveType as PrismaIncentiveType,
} from '@prisma/client';
import { CampaignStatus, CampaignType, IncentiveType } from '@localnow/shared';
import { PrismaService } from '../prisma/prisma.service';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import type { CampaignResult, SendCampaignResult } from './types';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCommercePanel(commerceAuthId: string): Promise<CampaignResult[]> {
    const commerce = await this.assertCommerce(commerceAuthId);
    const campaigns = await this.prisma.campaign.findMany({
      where: { commerceId: commerce.id },
      orderBy: { createdAt: 'desc' },
    });
    return campaigns.map((campaign) => this.toResult(campaign));
  }

  // Campaña manual/cruzada creada por el propio comercio (§8.4) — el motor de
  // sugerencias automáticas (AUTO_SUGGESTED) no existe todavía, así que esto siempre
  // queda con suggestedByAi=false, sin importar el `type` elegido en el body.
  async create(commerceAuthId: string, dto: CreateCampaignDto): Promise<CampaignResult> {
    const commerce = await this.assertCommerce(commerceAuthId);

    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la de fin');
    }
    if (dto.targetSegmentId) {
      const segment = await this.prisma.segment.findUnique({ where: { id: dto.targetSegmentId } });
      if (!segment) {
        throw new BadRequestException('El segmento indicado no existe');
      }
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        commerceId: commerce.id,
        cityId: commerce.cityId,
        name: dto.name,
        type: mirrorEnum<PrismaCampaignType>(dto.type),
        targetSegmentId: dto.targetSegmentId ?? null,
        incentiveType: mirrorEnum<PrismaIncentiveType>(dto.incentiveType),
        incentiveValue: dto.incentiveValue,
        pushMessage: dto.pushMessage,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        maxRedemptions: dto.maxRedemptions ?? null,
        budgetEuros: dto.budgetEuros ?? null,
        status: 'DRAFT',
        suggestedByAi: false,
      },
    });
    return this.toResult(campaign);
  }

  // PUT /panel/campaigns/:id/approve (§12, §8.4): el propio comercio aprueba su
  // campaña en borrador — no es una moderación de plataforma como Commerce/Coupon.
  async approve(id: string, commerceAuthId: string): Promise<CampaignResult> {
    const campaign = await this.findOwned(id, commerceAuthId);
    if (campaign.status !== 'DRAFT') {
      throw new BadRequestException('Solo se pueden aprobar campañas en borrador');
    }
    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { status: 'ACTIVE', approvedAt: new Date() },
    });
    return this.toResult(updated);
  }

  // No está en §12 — necesario para poder probar/operar el registro de impresiones
  // (§13.3 paso 6) sin tener todavía Firebase/Expo Push configurado: no envía
  // ninguna notificación real, solo registra CAMPAIGN_IMPRESSION por cada usuario
  // del segmento objetivo, tal como haría el paso 5-6 del flujo una vez exista el
  // envío real.
  async send(id: string, commerceAuthId: string): Promise<SendCampaignResult> {
    const campaign = await this.findOwned(id, commerceAuthId);
    if (campaign.status !== 'ACTIVE') {
      throw new BadRequestException('Solo se pueden enviar campañas activas');
    }
    if (!campaign.targetSegmentId) {
      throw new BadRequestException('Esta campaña no tiene un segmento objetivo asignado');
    }

    const targetUsers = await this.prisma.userSegment.findMany({
      where: { segmentId: campaign.targetSegmentId, active: true },
      select: { userId: true },
    });

    if (targetUsers.length > 0) {
      await this.prisma.campaignImpression.createMany({
        data: targetUsers.map((entry) => ({ campaignId: campaign.id, userId: entry.userId })),
      });
    }

    return { campaignId: campaign.id, impressionsSent: targetUsers.length };
  }

  private async assertCommerce(commerceAuthId: string) {
    const commerce = await this.prisma.commerce.findUnique({ where: { authId: commerceAuthId } });
    if (!commerce) {
      throw new ForbiddenException('Esta cuenta no está registrada como comercio');
    }
    return commerce;
  }

  private async findOwned(id: string, commerceAuthId: string): Promise<PrismaCampaign> {
    const campaign = await this.prisma.campaign.findUnique({ where: { id }, include: { commerce: true } });
    if (!campaign) {
      throw new NotFoundException('Campaña no encontrada');
    }
    if (campaign.commerce.authId !== commerceAuthId) {
      throw new ForbiddenException('No puedes gestionar la campaña de otro comercio');
    }
    return campaign;
  }

  private toResult(campaign: PrismaCampaign): CampaignResult {
    return {
      id: campaign.id,
      commerceId: campaign.commerceId,
      cityId: campaign.cityId,
      name: campaign.name,
      type: mirrorEnum<CampaignType>(campaign.type),
      targetSegmentId: campaign.targetSegmentId,
      incentiveType: mirrorEnum<IncentiveType>(campaign.incentiveType),
      incentiveValue: Number(campaign.incentiveValue),
      pushMessage: campaign.pushMessage,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      maxRedemptions: campaign.maxRedemptions,
      currentRedemptions: campaign.currentRedemptions,
      budgetEuros: campaign.budgetEuros ? Number(campaign.budgetEuros) : null,
      status: mirrorEnum<CampaignStatus>(campaign.status),
      suggestedByAi: campaign.suggestedByAi,
      approvedAt: campaign.approvedAt,
      createdAt: campaign.createdAt,
    };
  }
}
