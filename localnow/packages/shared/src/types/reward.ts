import type { RedemptionStatus, RewardType } from './enums';

export interface Reward {
  id: string;
  // null = recompensa global LocalNow, no ligada a un comercio concreto
  commerceId: string | null;
  title: string;
  description: string | null;
  pointsCost: number;
  valueEuros: number | null;
  type: RewardType;
  active: boolean;
  createdAt: Date;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  userId: string;
  commerceId: string;
  qrToken: string;
  qrExpiresAt: Date;
  status: RedemptionStatus;
  redeemedAt: Date | null;
  pointsDeducted: number;
  createdAt: Date;
}
