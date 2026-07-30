import { NEWS_CATEGORIES } from '@localnow/shared';
import { NEWS_CATEGORY_COLORS } from '@/lib/category-colors';
import { formatRelativeTime } from '@/lib/format';
import type { NewsArticle } from '@/lib/types';
import { BecomeCommerceButton } from '@/components/leads/become-commerce-button';
import { RelatedCommerces } from './related-commerces';

// Sin imagen, ancho completo — la tipografía editorial (título grande en serif)
// hace de protagonista en vez del hueco de una imagen que no existe.
export function NewsCardWide({ article, city }: { article: NewsArticle; city?: string }) {
  const label = NEWS_CATEGORIES.find((category) => category.value === article.category)?.label ?? article.category;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      >
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${NEWS_CATEGORY_COLORS[article.category]}`}
            >
              {label}
            </span>
            <span className="text-xs text-gray-500">{article.sourceName}</span>
          </div>
          <h2 className="font-serif text-xl font-bold leading-snug text-gray-900 group-hover:underline sm:text-2xl">
            {article.title}
          </h2>
          {article.summary ? <p className="line-clamp-2 text-sm text-gray-600">{article.summary}</p> : null}
        </div>
        <span className="shrink-0 text-xs text-gray-400">{formatRelativeTime(article.publishedAt)}</span>
      </a>
      <RelatedCommerces category={article.category} city={city} />
      <div className="border-t border-gray-100 px-5 py-3">
        <BecomeCommerceButton className="text-xs text-gray-400 hover:text-gray-600 hover:underline" defaultCity={city} />
      </div>
    </article>
  );
}
