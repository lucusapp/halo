// Espejo de los enums definidos en packages/api/prisma/schema.prisma.
// Mantener sincronizado manualmente: este paquete no depende de @prisma/client
// para poder usarse también en apps/web y apps/mobile sin arrastrar Node APIs.

export enum NewsCategory {
  MUNICIPIO = 'MUNICIPIO',
  DEPORTES = 'DEPORTES',
  ECONOMIA = 'ECONOMIA',
  JUDICIAL = 'JUDICIAL',
  CULTURA = 'CULTURA',
  DIPUTACION = 'DIPUTACION',
  SOCIEDAD = 'SOCIEDAD',
}

export enum CommerceCategory {
  RESTAURACION = 'RESTAURACION',
  COMERCIO = 'COMERCIO',
  SERVICIOS = 'SERVICIOS',
  OCIO = 'OCIO',
  SALUD = 'SALUD',
}

export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PRO = 'PRO',
}

export enum SubscriptionStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
}

export enum ProductUnit {
  UNIT = 'UNIT',
  KG = 'KG',
  L = 'L',
}

export enum ProductSource {
  MANUAL = 'MANUAL',
  IMPORT = 'IMPORT',
  OPENFOODFACTS = 'OPENFOODFACTS',
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  BIZUM = 'BIZUM',
  OTHER = 'OTHER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ANONYMOUS = 'ANONYMOUS',
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  TWO_FOR_ONE = 'TWO_FOR_ONE',
}

export enum CouponStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

// Estado de un QR de un solo uso (cupón o recompensa) — PROYECTO.md §6.6
export enum RedemptionStatus {
  PENDING = 'PENDING',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
}

export enum RewardType {
  DISCOUNT_PCT = 'DISCOUNT_PCT',
  DISCOUNT_FIXED = 'DISCOUNT_FIXED',
  FREE_PRODUCT = 'FREE_PRODUCT',
  GIFT = 'GIFT',
}

export enum CampaignType {
  AUTO_SUGGESTED = 'AUTO_SUGGESTED',
  MANUAL = 'MANUAL',
  CROSS_COMMERCE = 'CROSS_COMMERCE',
}

export enum IncentiveType {
  DISCOUNT = 'DISCOUNT',
  POINTS = 'POINTS',
  GIFT = 'GIFT',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MODERATOR = 'MODERATOR',
}
