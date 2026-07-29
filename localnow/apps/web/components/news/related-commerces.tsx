import Link from 'next/link';
import { COMMERCE_CATEGORIES, NEWS_TO_COMMERCE_CATEGORY, type NewsCategory } from '@localnow/shared';
import { apiFetch } from '@/lib/api';
import { withBasePath } from '@/lib/base-path';
import type { PublicCommerce } from '@/lib/types';

// PROYECTO.md §19.2: cada tarjeta de noticia lleva al pie 2-3 comercios locales de
// su misma categoría — mapeo automático por categoría (NEWS_TO_COMMERCE_CATEGORY),
// sin tabla de traducción intermedia porque ambos enums comparten el mismo espacio
// de valores. Municipio/Judicial/Sociedad no tienen comercio asociado: no rinden nada.
export async function RelatedCommerces({ category, city }: { category: NewsCategory; city?: string }) {
  const commerceCategory = NEWS_TO_COMMERCE_CATEGORY[category];
  if (!commerceCategory) return null;

  const query = new URLSearchParams({ category: commerceCategory });
  if (city) query.set('city', city);

  const commerces = await apiFetch<PublicCommerce[]>(`/commerce?${query.toString()}`).catch(() => []);
  const related = commerces.slice(0, 3);
  if (related.length === 0) return null;

  const categoryLabel = COMMERCE_CATEGORIES.find((option) => option.value === commerceCategory)?.label;

  return (
    <div className="border-t border-gray-100 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Negocios relacionados</p>
      <div className="flex flex-col gap-1.5">
        {related.map((commerce) => (
          <Link
            key={commerce.id}
            href={withBasePath(`/comercios/${commerce.id}`)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-50"
          >
            {commerce.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={commerce.logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">
                {commerce.name.charAt(0)}
              </div>
            )}
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-medium text-gray-900">{commerce.name}</span>
              <span className="text-[11px] text-gray-400">{categoryLabel ?? commerceCategory}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
