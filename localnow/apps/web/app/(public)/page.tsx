import Link from 'next/link';
import { NEWS_CATEGORIES } from '@localnow/shared';
import { apiFetch } from '@/lib/api';
import { segmentNewsArticles } from '@/lib/news-layout';
import type { PaginatedNewsArticles } from '@/lib/types';
import { CategoryPills } from '@/components/ui/category-pills';
import { Pagination } from '@/components/ui/pagination';
import { NewsHeroCard } from '@/components/news/news-hero-card';
import { NewsCard } from '@/components/news/news-card';
import { NewsCardWide } from '@/components/news/news-card-wide';
import { CategoryTilesGrid } from '@/components/news/category-tiles-grid';

interface HomePageProps {
  searchParams: { city?: string; category?: string; page?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Portada = cuadrícula de categorías, tipo Flipboard (una tarjeta grande por
  // categoría con su último titular). Pulsar una categoría lleva a su propio feed
  // (misma ruta, con ?category= — evita duplicar el hero/grid/paginación que ya
  // existían para eso).
  if (!searchParams.category) {
    return (
      <main className="flex flex-col gap-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Portada</h1>
        <CategoryTilesGrid city={searchParams.city} />
      </main>
    );
  }

  const categoryLabel = NEWS_CATEGORIES.find((category) => category.value === searchParams.category)?.label;

  const query = new URLSearchParams();
  if (searchParams.city) query.set('city', searchParams.city);
  query.set('category', searchParams.category);
  if (searchParams.page) query.set('page', searchParams.page);

  const data = await apiFetch<PaginatedNewsArticles>(`/news?${query.toString()}`);

  // Preferimos como portada un artículo marcado como destacado por el panel de
  // admin (§4); si no hay ninguno en esta página, cae al más reciente.
  const heroIndex = data.items.findIndex((article) => article.featured);
  const hero = data.items[heroIndex >= 0 ? heroIndex : 0];
  const rest = data.items.filter((_, index) => index !== (heroIndex >= 0 ? heroIndex : 0));
  const segments = segmentNewsArticles(rest);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={'/'} className="w-fit text-sm text-gray-500 hover:underline">
          ← Todas las categorías
        </Link>
        <h1 className="font-serif text-2xl font-bold text-gray-900">{categoryLabel ?? searchParams.category}</h1>
      </div>

      <CategoryPills categories={NEWS_CATEGORIES} activeValue={searchParams.category} basePath="/" />

      {!hero ? (
        <p className="py-12 text-center text-gray-500">Todavía no hay noticias en esta categoría.</p>
      ) : (
        <>
          <NewsHeroCard article={hero} city={searchParams.city} />

          <div className="flex flex-col gap-4">
            {segments.map((segment) => {
              if (segment.type === 'wide') {
                return <NewsCardWide key={segment.item.id} article={segment.item} city={searchParams.city} />;
              }
              if (segment.type === 'pair') {
                return (
                  <div key={segment.items[0].id} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <NewsCard article={segment.items[0]} city={searchParams.city} />
                    <NewsCard article={segment.items[1]} city={searchParams.city} />
                  </div>
                );
              }
              return (
                <div key={segment.item.id} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <NewsCard article={segment.item} city={searchParams.city} />
                </div>
              );
            })}
          </div>
        </>
      )}

      <Pagination page={data.page} totalPages={data.totalPages} basePath="/" searchParams={searchParams} />
    </main>
  );
}
