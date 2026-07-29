import type { CommerceCategory, NewsCategory } from '@localnow/shared';

// Mismo color por categoría en noticias y comercios cuando el nombre coincide
// (PROYECTO.md §19: ambas comparten el mismo espacio de valores) — refuerza
// visualmente el mapeo editorial-comercio.
export const NEWS_CATEGORY_COLORS: Record<NewsCategory, string> = {
  MUNICIPIO: 'bg-blue-100 text-blue-700',
  DEPORTES: 'bg-green-100 text-green-700',
  ECONOMIA: 'bg-amber-100 text-amber-700',
  GASTRONOMIA: 'bg-orange-100 text-orange-700',
  HOGAR_DECORACION: 'bg-lime-100 text-lime-700',
  SALUD_BIENESTAR: 'bg-rose-100 text-rose-700',
  CULTURA_OCIO: 'bg-purple-100 text-purple-700',
  EDUCACION: 'bg-cyan-100 text-cyan-700',
  TECNOLOGIA: 'bg-indigo-100 text-indigo-700',
  MODA_BELLEZA: 'bg-pink-100 text-pink-700',
  MOTOR: 'bg-slate-100 text-slate-700',
  MASCOTAS: 'bg-yellow-100 text-yellow-700',
  INMOBILIARIA: 'bg-teal-100 text-teal-700',
  JUDICIAL: 'bg-red-100 text-red-700',
  SOCIEDAD: 'bg-violet-100 text-violet-700',
};

export const COMMERCE_CATEGORY_COLORS: Record<CommerceCategory, string> = {
  DEPORTES: 'bg-green-100 text-green-700',
  ECONOMIA: 'bg-amber-100 text-amber-700',
  GASTRONOMIA: 'bg-orange-100 text-orange-700',
  HOGAR_DECORACION: 'bg-lime-100 text-lime-700',
  SALUD_BIENESTAR: 'bg-rose-100 text-rose-700',
  CULTURA_OCIO: 'bg-purple-100 text-purple-700',
  EDUCACION: 'bg-cyan-100 text-cyan-700',
  TECNOLOGIA: 'bg-indigo-100 text-indigo-700',
  MODA_BELLEZA: 'bg-pink-100 text-pink-700',
  MOTOR: 'bg-slate-100 text-slate-700',
  MASCOTAS: 'bg-yellow-100 text-yellow-700',
  INMOBILIARIA: 'bg-teal-100 text-teal-700',
};
