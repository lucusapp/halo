import { CommerceCategory, NewsCategory } from '../types/enums';

// PROYECTO.md §19.2: "cada tarjeta de noticia incluye al pie comercios locales
// vinculados a su categoría. El mapeo es automático por categoría." Mismo espacio
// de valores para las 12 categorías que sí tienen comercios asociados (§19.1) —
// null para las 3 que son contenido editorial puro sin vinculación comercial
// (Municipio, Judicial, Sociedad).
export const NEWS_TO_COMMERCE_CATEGORY: Record<NewsCategory, CommerceCategory | null> = {
  [NewsCategory.MUNICIPIO]: null,
  [NewsCategory.DEPORTES]: CommerceCategory.DEPORTES,
  [NewsCategory.ECONOMIA]: CommerceCategory.ECONOMIA,
  [NewsCategory.GASTRONOMIA]: CommerceCategory.GASTRONOMIA,
  [NewsCategory.HOGAR_DECORACION]: CommerceCategory.HOGAR_DECORACION,
  [NewsCategory.SALUD_BIENESTAR]: CommerceCategory.SALUD_BIENESTAR,
  [NewsCategory.CULTURA_OCIO]: CommerceCategory.CULTURA_OCIO,
  [NewsCategory.EDUCACION]: CommerceCategory.EDUCACION,
  [NewsCategory.TECNOLOGIA]: CommerceCategory.TECNOLOGIA,
  [NewsCategory.MODA_BELLEZA]: CommerceCategory.MODA_BELLEZA,
  [NewsCategory.MOTOR]: CommerceCategory.MOTOR,
  [NewsCategory.MASCOTAS]: CommerceCategory.MASCOTAS,
  [NewsCategory.INMOBILIARIA]: CommerceCategory.INMOBILIARIA,
  [NewsCategory.JUDICIAL]: null,
  [NewsCategory.SOCIEDAD]: null,
};
