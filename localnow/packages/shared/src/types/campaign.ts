import type { CampaignStatus, CampaignType, IncentiveType } from './enums';

export interface Campaign {
  id: string;
  // comercio que paga/lanza la campaña
  commerceId: string;
  cityId: string;
  name: string;
  type: CampaignType;
  targetSegmentId: string | null;
  incentiveType: IncentiveType;
  incentiveValue: number;
  // mensaje push: SIEMPRE genérico, nunca revela el criterio de selección (§8.1, §17.6)
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

export interface CampaignImpression {
  id: string;
  campaignId: string;
  userId: string;
  sentAt: Date;
  opened: boolean;
}
