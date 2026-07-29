import { CommerceCategory, NewsCategory } from '../types/enums';

export interface CategoryOption<T extends string> {
  value: T;
  label: string;
}

// Orden y etiquetas según PROYECTO.md §4.2 / §19.1
export const NEWS_CATEGORIES: CategoryOption<NewsCategory>[] = [
  { value: NewsCategory.MUNICIPIO, label: 'Municipio' },
  { value: NewsCategory.DEPORTES, label: 'Deportes' },
  { value: NewsCategory.ECONOMIA, label: 'Economía' },
  { value: NewsCategory.GASTRONOMIA, label: 'Gastronomía' },
  { value: NewsCategory.HOGAR_DECORACION, label: 'Hogar y Decoración' },
  { value: NewsCategory.SALUD_BIENESTAR, label: 'Salud y Bienestar' },
  { value: NewsCategory.CULTURA_OCIO, label: 'Cultura y Ocio' },
  { value: NewsCategory.EDUCACION, label: 'Educación' },
  { value: NewsCategory.TECNOLOGIA, label: 'Tecnología' },
  { value: NewsCategory.MODA_BELLEZA, label: 'Moda y Belleza' },
  { value: NewsCategory.MOTOR, label: 'Motor' },
  { value: NewsCategory.MASCOTAS, label: 'Mascotas' },
  { value: NewsCategory.INMOBILIARIA, label: 'Inmobiliaria' },
  { value: NewsCategory.JUDICIAL, label: 'Judicial' },
  { value: NewsCategory.SOCIEDAD, label: 'Sociedad' },
];

// Orden y etiquetas según PROYECTO.md §5.2 / §19.1 — mismo espacio de valores que
// NEWS_CATEGORIES, sin Municipio/Judicial/Sociedad (sin vinculación comercial directa).
export const COMMERCE_CATEGORIES: CategoryOption<CommerceCategory>[] = [
  { value: CommerceCategory.DEPORTES, label: 'Deportes' },
  { value: CommerceCategory.ECONOMIA, label: 'Economía' },
  { value: CommerceCategory.GASTRONOMIA, label: 'Gastronomía' },
  { value: CommerceCategory.HOGAR_DECORACION, label: 'Hogar y Decoración' },
  { value: CommerceCategory.SALUD_BIENESTAR, label: 'Salud y Bienestar' },
  { value: CommerceCategory.CULTURA_OCIO, label: 'Cultura y Ocio' },
  { value: CommerceCategory.EDUCACION, label: 'Educación' },
  { value: CommerceCategory.TECNOLOGIA, label: 'Tecnología' },
  { value: CommerceCategory.MODA_BELLEZA, label: 'Moda y Belleza' },
  { value: CommerceCategory.MOTOR, label: 'Motor' },
  { value: CommerceCategory.MASCOTAS, label: 'Mascotas' },
  { value: CommerceCategory.INMOBILIARIA, label: 'Inmobiliaria' },
];
