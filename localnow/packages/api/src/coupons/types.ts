import type { CouponType, CouponStatus } from '@localnow/shared';

export interface CouponResult {
  id: string;
  commerceId: string;
  title: string;
  description: string | null;
  type: CouponType;
  value: number;
  startDate: Date;
  endDate: Date;
  maxRedemptions: number;
  currentRedemptions: number;
  status: CouponStatus;
  createdAt: Date;
}

// GET /admin/coupons/pending — moderación (§5.3, §9.1): el nombre del comercio no
// está en CouponResult (el panel del propio comercio ya sabe de quién es), pero
// admin necesita verlo sin una segunda consulta por cupón.
export interface AdminCouponResult extends CouponResult {
  commerceName: string;
}

// POST /user/coupons/:id/activate (§5.3 paso 4).
export interface CouponActivationResult {
  redemptionId: string;
  qrToken: string;
  qrExpiresAt: Date;
  couponId: string;
  couponTitle: string;
}

// GET /user/coupons/active
export interface UserActiveCouponResult {
  redemptionId: string;
  qrToken: string;
  qrExpiresAt: Date;
  coupon: CouponResult;
}
