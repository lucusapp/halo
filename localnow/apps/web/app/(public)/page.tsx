import { NEWS_CATEGORIES } from '@localnow/shared';
import { apiFetch } from '@/lib/api';
import type { PaginatedNewsArticles } from '@/lib/types';
import { CategoryPills } from '@/components/ui/category-pills';
import { Pagination } from '@/components/ui/pagination';
import { NewsHeroCard } from '@/components/news/news-hero-card';
import { NewsCard } from '@/components/news/news-card';

interface HomePageProps {
  searchParams: { city?: string; category?: string; page?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = new URLSearchParams();
  if (searchParams.city) query.set('city', searchParams.city);
  if (searchParams.category) query.set('category', searchParams.category);
  if (searchParams.page) query.set('page', searchParams.page);

  const data = await apiFetch<PaginatedNewsArticles>(`/news?${query.toString()}`);

  // Preferimos como portada un artículo marcado como destacado por el panel de
  // admin (§4); si no hay ninguno en esta página, cae al más reciente.
  const heroIndex = data.items.findIndex((article) => article.featured);
  const hero = data.items[heroIndex >= 0 ? heroIndex : 0];
  const rest = data.items.filter((_, index) => index !== (heroIndex >= 0 ? heroIndex : 0));

  return (
    <main className="flex flex-col gap-6">
      <CategoryPills categories={NEWS_CATEGORIES} activeValue={searchParams.category} basePath="/" />

      {!hero ? (
        <p className="py-12 text-center text-gray-500">Todavía no hay noticias publicadas.</p>
      ) : (
        <>
          <NewsHeroCard article={hero} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}

      <Pagination page={data.page} totalPages={data.totalPages} basePath="/" searchParams={searchParams} />
    </main>
  );
}
