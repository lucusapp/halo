import type { CampaignStatus, CampaignType, IncentiveType } from '@localnow/shared';

export interface CampaignResult {
  id: string;
  commerceId: string;
  cityId: string;
  name: string;
  type: CampaignType;
  targetSegmentId: string | null;
  incentiveType: IncentiveType;
  incentiveValue: number;
  pushMessage: string;
  startDate: Date;
  endDate: Date;
  maxRedemptions: number | null;
  currentRedemptions: number;
  budgetEuros: number | null;
  status: CampaignStatus;
  suggestedByAi: boolean;
  approvedAt: Date | null;
  createdAt: Date;
}

// POST /panel/campaigns/:id/send — no está en §12, ver comentario en el controller.
export interface SendCampaignResult {
  campaignId: string;
  impressionsSent: number;
}
