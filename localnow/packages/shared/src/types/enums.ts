// Espejo de los enums definidos en packages/api/prisma/schema.prisma.
// Mantener sincronizado manualmente: este paquete no depende de @prisma/client
// para poder usarse también en apps/web y apps/mobile sin arrastrar Node APIs.

// PROYECTO.md §19: 15 categorías de contenido, 3 de ellas (Municipio, Judicial,
// Sociedad) sin vinculación comercial directa — ver CommerceCategory justo debajo,
// que usa el mismo espacio de valores para las 12 restantes a propósito, así el
// mapeo editorial-comercio de cada tarjeta de noticia es una igualdad de categoría
// sin tabla de traducción intermedia.
export enum NewsCategory {
  MUNICIPIO = 'MUNICIPIO',
  DEPORTES = 'DEPORTES',
  ECONOMIA = 'ECONOMIA',
  GASTRONOMIA = 'GASTRONOMIA',
  HOGAR_DECORACION = 'HOGAR_DECORACION',
  SALUD_BIENESTAR = 'SALUD_BIENESTAR',
  CULTURA_OCIO = 'CULTURA_OCIO',
  EDUCACION = 'EDUCACION',
  TECNOLOGIA = 'TECNOLOGIA',
  MODA_BELLEZA = 'MODA_BELLEZA',
  MOTOR = 'MOTOR',
  MASCOTAS = 'MASCOTAS',
  INMOBILIARIA = 'INMOBILIARIA',
  JUDICIAL = 'JUDICIAL',
  SOCIEDAD = 'SOCIEDAD',
}

// Subconjunto de NewsCategory (§19.1) — mismos valores, sin MUNICIPIO/JUDICIAL/SOCIEDAD.
export enum CommerceCategory {
  DEPORTES = 'DEPORTES',
  ECONOMIA = 'ECONOMIA',
  GASTRONOMIA = 'GASTRONOMIA',
  HOGAR_DECORACION = 'HOGAR_DECORACION',
  SALUD_BIENESTAR = 'SALUD_BIENESTAR',
  CULTURA_OCIO = 'CULTURA_OCIO',
  EDUCACION = 'EDUCACION',
  TECNOLOGIA = 'TECNOLOGIA',
  MODA_BELLEZA = 'MODA_BELLEZA',
  MOTOR = 'MOTOR',
  MASCOTAS = 'MASCOTAS',
  INMOBILIARIA = 'INMOBILIARIA',
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
