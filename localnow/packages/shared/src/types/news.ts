import type { NewsCategory } from './enums';

export interface NewsSource {
  id: string;
  cityId: string;
  name: string;
  url: string;
  feedUrl: string | null;
  category: NewsCategory | null;
  active: boolean;
  lastFetchedAt: Date | null;
  createdAt: Date;
}

export interface NewsArticle {
  id: string;
  sourceId: string;
  cityId: string;
  title: string;
  summary: string | null;
  url: string;
  imageUrl: string | null;
  category: NewsCategory;
  publishedAt: Date;
  fetchedAt: Date;
  featured: boolean;
}
