import type { CommerceCategory, CouponStatus, CouponType, NewsCategory } from '@localnow/shared';

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
