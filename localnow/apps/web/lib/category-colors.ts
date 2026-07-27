import type { CommerceCategory, NewsCategory } from '@localnow/shared';

export const NEWS_CATEGORY_COLORS: Record<NewsCategory, string> = {
  MUNICIPIO: 'bg-blue-100 text-blue-700',
  DEPORTES: 'bg-green-100 text-green-700',
  ECONOMIA: 'bg-amber-100 text-amber-700',
  JUDICIAL: 'bg-red-100 text-red-700',
  CULTURA: 'bg-purple-100 text-purple-700',
  DIPUTACION: 'bg-indigo-100 text-indigo-700',
  SOCIEDAD: 'bg-pink-100 text-pink-700',
};

export const COMMERCE_CATEGORY_COLORS: Record<CommerceCategory, string> = {
  RESTAURACION: 'bg-orange-100 text-orange-700',
  COMERCIO: 'bg-blue-100 text-blue-700',
  SERVICIOS: 'bg-teal-100 text-teal-700',
  OCIO: 'bg-purple-100 text-purple-700',
  SALUD: 'bg-red-100 text-red-700',
};
