import type {
  CommerceCategory,
  CouponStatus,
  CouponType,
  NewsCategory,
  PaymentMethod,
  ProductSource,
  ProductUnit,
  RewardType,
  SubscriptionPlan,
  SubscriptionStatus,
  TransactionStatus,
} from '@localnow/shared';

// Réplica mínima de las formas de respuesta reales de packages/api
// (NewsArticleResult, PaginatedNewsResult, PublicCommerceResult, CouponResult).
// No se comparten desde @localnow/shared todavía porque apps/web es, por ahora, el
// único consumidor de estas rutas; se promueven a shared si apps/mobile también las
// necesita.
export interface NewsArticle {
  id: string;
  sourceId: string;
  sourceName: string;
  cityId: string;
  title: string;
  summary: string | null;
  url: string;
  imageUrl: string | null;
  category: NewsCategory;
  publishedAt: string;
  featured: boolean;
}

export interface PaginatedNewsArticles {
  items: NewsArticle[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PublicCommerce {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  category: CommerceCategory;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string;
  logoUrl: string | null;
  description: string | null;
  schedule: Record<string, string> | null;
  createdAt: string;
}

export interface Coupon {
  id: string;
  commerceId: string;
  title: string;
  description: string | null;
  type: CouponType;
  value: number;
  startDate: string;
  endDate: string;
  maxRedemptions: number;
  currentRedemptions: number;
  status: CouponStatus;
  createdAt: string;
}

// Réplica de AdminCouponResult (packages/api/src/coupons/types.ts).
export interface AdminCoupon extends Coupon {
  commerceName: string;
}

// Réplica de TicketItemResult/TicketResult/TicketSummaryResult (packages/api/src/transactions/types.ts).
export interface TicketItem {
  productId: string | null;
  ean: string | null;
  plu: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface TicketSummary {
  id: string;
  commerceId: string;
  commerceName: string;
  commerceSlug: string;
  status: TransactionStatus;
  timestamp: string;
  totalAmount: number;
  paymentMethod: PaymentMethod | null;
  pointsGlobalEarned: number;
  pointsCommerceEarned: number;
}

export interface Ticket extends TicketSummary {
  items: TicketItem[];
}

// Réplica de UserPointsResult/CommercePointsBalance (packages/api/src/points/types.ts).
export interface CommercePointsBalance {
  commerceId: string;
  commerceName: string;
  commerceSlug: string;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
}

export interface UserPoints {
  global: {
    balance: number;
    totalEarned: number;
    totalRedeemed: number;
  };
  commerces: CommercePointsBalance[];
}

// Réplica de AvailableRewardResult (packages/api/src/rewards/types.ts).
export interface AvailableReward {
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

// Réplica de CommerceSaleSummaryResult/PanelDashboardResult (packages/api/src/transactions/types.ts).
export interface CommerceSaleSummary {
  id: string;
  timestamp: string;
  totalAmount: number;
  pointsGlobalEarned: number;
  status: TransactionStatus;
}

export interface PanelDashboard {
  today: {
    salesCount: number;
    totalAmount: number;
    pointsGlobalIssued: number;
  };
  recentSales: CommerceSaleSummary[];
}

// Réplica de SaleCreatedResult (packages/api/src/transactions/types.ts) — respuesta
// de POST /panel/sale/new.
export interface SaleCreated {
  transactionId: string;
  qrToken: string;
  qrExpiresAt: string;
  totalAmount: number;
}

// Réplica de ProductResult (packages/api/src/products/types.ts).
export interface Product {
  id: string;
  commerceId: string;
  ean: string | null;
  plu: string | null;
  name: string;
  category: string | null;
  price: number;
  unit: ProductUnit;
  imageUrl: string | null;
  active: boolean;
  source: ProductSource;
  createdAt: string;
}

// Réplica de NewsSourceResult (packages/api/src/news/types.ts).
export interface NewsSource {
  id: string;
  cityId: string;
  name: string;
  url: string;
  feedUrl: string | null;
  category: NewsCategory | null;
  active: boolean;
  lastFetchedAt: string | null;
  createdAt: string;
}

// Réplica de AdminCommerceResult (packages/api/src/commerce/types.ts).
export interface AdminCommerce {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  category: CommerceCategory;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string;
  logoUrl: string | null;
  description: string | null;
  schedule: Record<string, string> | null;
  createdAt: string;
  cif: string;
  verified: boolean;
  active: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan | null;
}

// Réplica de SegmentResult (packages/api/src/segments/types.ts).
export interface Segment {
  id: string;
  cityId: string;
  name: string;
  description: string | null;
  rules: Record<string, unknown>;
  userCount: number;
  lastComputedAt: string | null;
  active: boolean;
  createdAt: string;
}

// Réplica de PromotionResult (packages/api/src/promotions/types.ts).
export interface Promotion {
  id: string;
  cityId: string | null;
  cityName: string | null;
  name: string;
  description: string | null;
  pointsMultiplier: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

// Réplica de AdminUserResult (packages/api/src/admin/types.ts).
export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  cityId: string | null;
  cityName: string | null;
  pointsGlobalBalance: number;
  createdAt: string;
}

// Réplica de CityResult (packages/api/src/admin/types.ts).
export interface City {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  pointsRatioGlobal: number;
}

// Réplica de PlatformConfigResult (packages/api/src/admin/types.ts).
export interface PlatformConfig {
  qrExpiryMinutes: number;
}

// Réplica de GlobalAnalyticsResult (packages/api/src/admin/types.ts).
export interface GlobalAnalytics {
  cities: { total: number; active: number };
  commerces: { total: number; active: number; pending: number };
  users: { total: number };
  transactions: {
    totalConfirmed: number;
    totalRevenue: number;
    today: { count: number; totalAmount: number };
  };
  points: { totalGlobalIssued: number; totalGlobalRedeemed: number };
  coupons: { total: number; active: number; totalRedemptions: number };
  campaigns: { total: number; active: number; totalImpressions: number };
}

// Réplica de PublicCityResult (packages/api/src/cities/types.ts).
export interface PublicCity {
  id: string;
  name: string;
  slug: string;
}
