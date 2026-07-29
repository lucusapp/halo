import { NEWS_CATEGORIES } from '@localnow/shared';
import { apiFetch } from '@/lib/api';
import type { PaginatedNewsArticles } from '@/lib/types';
import { CategoryTile } from './category-tile';

// Home = cuadrícula de categorías (una petición por categoría, en paralelo — son
// baratas y cacheadas 60s como el resto de apiFetch). Se pide solo page=1 de cada
// una: basta con el artículo más reciente para la portada de la tarjeta. Las
// categorías sin ningún artículo todavía no se muestran — una tarjeta sin foto ni
// titular no aporta nada y rompe la maqueta tipo revista.
export async function CategoryTilesGrid({ city }: { city?: string }) {
  const results = await Promise.all(
    NEWS_CATEGORIES.map(async (category) => {
      const query = new URLSearchParams({ category: category.value, page: '1' });
      if (city) query.set('city', city);
      const data = await apiFetch<PaginatedNewsArticles>(`/news?${query.toString()}`).catch(
        () => null as PaginatedNewsArticles | null,
      );
      return { category, topArticle: data?.items[0] ?? null };
    }),
  );

  const tiles = results.filter(
    (result): result is { category: (typeof NEWS_CATEGORIES)[number]; topArticle: NonNullable<typeof result.topArticle> } =>
      result.topArticle !== null,
  );

  if (tiles.length === 0) {
    return <p className="py-12 text-center text-gray-500">Todavía no hay noticias publicadas.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map(({ category, topArticle }) => (
        <CategoryTile key={category.value} category={category.value} label={category.label} topArticle={topArticle} />
      ))}
    </div>
  );
}
