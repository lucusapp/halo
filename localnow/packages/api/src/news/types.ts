import type { NewsCategory } from '@localnow/shared';

export interface NewsArticleResult {
  id: string;
  sourceId: string;
  sourceName: string;
  cityId: string;
  title: string;
  summary: string | null;
  url: string;
  imageUrl: string | null;
  category: NewsCategory;
  publishedAt: Date;
  featured: boolean;
}

export interface PaginatedNewsResult {
  items: NewsArticleResult[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
