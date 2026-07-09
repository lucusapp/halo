import type { CouponStatus, CouponType, RedemptionStatus } from './enums';

export interface Coupon {
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
  updatedAt: Date;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  userId: string;
  // UUID v4 / JWT firmado en servidor — nunca generado en el cliente (§6.6)
  qrToken: string;
  qrExpiresAt: Date;
  status: RedemptionStatus;
  redeemedAt: Date | null;
  createdAt: Date;
}
