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

export interface NewsSourceResult {
  id: string;
  cityId: string;
  name: string;
  url: string;
  feedUrl: string | null;
  // Solo resguardo (fallback) cuando la heurística por palabras clave no clasifica
  // el artículo — ver categorize-article.util.ts.
  category: NewsCategory | null;
  active: boolean;
  lastFetchedAt: Date | null;
  createdAt: Date;
}
