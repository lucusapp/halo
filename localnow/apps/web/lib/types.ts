import type {
  CommerceCategory,
  CouponStatus,
  CouponType,
  NewsCategory,
  PaymentMethod,
  RewardType,
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
