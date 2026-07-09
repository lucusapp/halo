import type { CommerceCategory, SubscriptionPlan, SubscriptionStatus } from './enums';

// Horario semanal en formato libre, ej: { "mon": "09:00-20:00" } (PROYECTO.md §11)
export type CommerceSchedule = Record<string, string>;

export interface Commerce {
  id: string;
  authId: string;
  name: string;
  slug: string;
  cityId: string;
  category: CommerceCategory;
  cif: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string;
  logoUrl: string | null;
  description: string | null;
  schedule: CommerceSchedule | null;
  active: boolean;
  verified: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommercePointsConfig {
  id: string;
  commerceId: string;
  // puntos propios del comercio por € gastado
  pointsRatio: number;
  rewardThreshold: number | null;
  updatedAt: Date;
}

export interface UserPointsCommerce {
  id: string;
  userId: string;
  commerceId: string;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  updatedAt: Date;
}
