import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { authFetch, isNotAdmin } from '@/lib/auth-api';
import type { City, NewsSource, PaginatedNewsArticles } from '@/lib/types';
import { NotAdminNotice } from '../../not-admin-notice';
import { CreateSourceForm } from './create-source-form';
import { SourceRow } from './source-row';
import { ArticleRow } from './article-row';

export default async function AdminNoticiasPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  let sources: NewsSource[];
  let cities: City[];
  try {
    [sources, cities] = await Promise.all([
      authFetch<NewsSource[]>('/admin/news-sources'),
      authFetch<City[]>('/admin/cities'),
    ]);
  } catch (error) {
    if (isNotAdmin(error)) {
      return <NotAdminNotice />;
    }
    throw error;
  }

  const recentNews = await apiFetch<PaginatedNewsArticles>('/news');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gestión editorial</h1>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Fuentes RSS</h2>
        <CreateSourceForm cities={cities} />
        {sources.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no hay fuentes configuradas.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sources.map((source) => (
              <SourceRow key={source.id} source={source} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Últimos artículos</h2>
        {recentNews.items.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no hay artículos publicados.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentNews.items.map((article) => (
              <ArticleRow key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
