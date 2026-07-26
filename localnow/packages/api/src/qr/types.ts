// Respuesta de POST /qr/validate (§12). `valid` es siempre `true` en una respuesta
// 200 — los casos inválidos (no existe, ya usado, caducado, comercio equivocado)
// se devuelven como errores HTTP (404/400/403), igual que en el resto de la API, en
// vez de un `valid: false` con 200 OK.
export interface QrValidationResult {
  valid: true;
  type: 'coupon' | 'reward';
  detail: CouponRedemptionDetail | RewardRedemptionDetail;
}

export interface CouponRedemptionDetail {
  redemptionId: string;
  couponId: string;
  couponTitle: string;
  userId: string;
}

export interface RewardRedemptionDetail {
  redemptionId: string;
  rewardId: string;
  rewardTitle: string;
  userId: string;
  pointsDeducted: number;
}
