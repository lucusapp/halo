import { CommerceCategory, NewsCategory } from '../types/enums';

export interface CategoryOption<T extends string> {
  value: T;
  label: string;
}

// Orden y etiquetas según PROYECTO.md §4.2
export const NEWS_CATEGORIES: CategoryOption<NewsCategory>[] = [
  { value: NewsCategory.MUNICIPIO, label: 'Municipio' },
  { value: NewsCategory.DEPORTES, label: 'Deportes' },
  { value: NewsCategory.ECONOMIA, label: 'Economía' },
  { value: NewsCategory.JUDICIAL, label: 'Judicial' },
  { value: NewsCategory.CULTURA, label: 'Cultura' },
  { value: NewsCategory.DIPUTACION, label: 'Diputación' },
  { value: NewsCategory.SOCIEDAD, label: 'Sociedad' },
];

// Orden y etiquetas según PROYECTO.md §5.2
export const COMMERCE_CATEGORIES: CategoryOption<CommerceCategory>[] = [
  { value: CommerceCategory.RESTAURACION, label: 'Restauración' },
  { value: CommerceCategory.COMERCIO, label: 'Comercio' },
  { value: CommerceCategory.SERVICIOS, label: 'Servicios' },
  { value: CommerceCategory.OCIO, label: 'Ocio' },
  { value: CommerceCategory.SALUD, label: 'Salud' },
];
