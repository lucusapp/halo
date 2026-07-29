import { NEWS_CATEGORIES } from '@localnow/shared';
import { NEWS_CATEGORY_COLORS } from '@/lib/category-colors';
import { formatRelativeTime } from '@/lib/format';
import type { NewsArticle } from '@/lib/types';
import { NewsImage } from './news-image';
import { RelatedCommerces } from './related-commerces';

export function NewsCard({ article, city }: { article: NewsArticle; city?: string }) {
  const label = NEWS_CATEGORIES.find((category) => category.value === article.category)?.label ?? article.category;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="group flex flex-1 flex-col">
        {article.imageUrl ? (
          <div className="relative h-40 w-full">
            <NewsImage src={article.imageUrl} />
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-gray-100">
            <span className="text-xs text-gray-400">LocalNow</span>
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <span
            className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${NEWS_CATEGORY_COLORS[article.category]}`}
          >
            {label}
          </span>
          <h2 className="font-serif text-base font-bold leading-snug text-gray-900 group-hover:underline line-clamp-3">
            {article.title}
          </h2>
          <span className="mt-auto text-xs text-gray-400">{formatRelativeTime(article.publishedAt)}</span>
        </div>
      </a>
      <RelatedCommerces category={article.category} city={city} />
    </article>
  );
}
