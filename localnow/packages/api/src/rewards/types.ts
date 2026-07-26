import type { RewardType } from '@localnow/shared';

// GET /user/rewards/available (§6.5): "recompensas bloqueadas (visibles pero con
// candado, mostrando cuántos puntos faltan)" — locked/pointsMissing lo calculamos
// aquí en vez de dejárselo al cliente, comparando contra el saldo real del usuario.
export interface AvailableRewardResult {
  id: string;
  commerceId: string | null;
  title: string;
  description: string | null;
  pointsCost: number;
  valueEuros: number | null;
  type: RewardType;
  locked: boolean;
  pointsMissing: number;
}

// POST /user/rewards/:id/redeem
export interface RewardRedemptionResult {
  redemptionId: string;
  qrToken: string;
  qrExpiresAt: Date;
  rewardId: string;
  rewardTitle: string;
  pointsDeducted: number;
}
