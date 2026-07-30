import { NEWS_CATEGORIES } from '@localnow/shared';
import { NEWS_CATEGORY_COLORS } from '@/lib/category-colors';
import { formatRelativeTime } from '@/lib/format';
import type { NewsArticle } from '@/lib/types';
import { BecomeCommerceButton } from '@/components/leads/become-commerce-button';
import { NewsImage } from './news-image';
import { RelatedCommerces } from './related-commerces';

// El enlace externo al artículo original solo envuelve la parte "portada" (imagen +
// título + resumen) — no toda la tarjeta, porque "Negocios relacionados" tiene sus
// propios enlaces internos y un <a> no puede anidar otro <a>.
export function NewsHeroCard({ article, city }: { article: NewsArticle; city?: string }) {
  const label = NEWS_CATEGORIES.find((category) => category.value === article.category)?.label ?? article.category;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="group block">
        {article.imageUrl ? (
          <div className="relative h-56 w-full sm:h-80">
            <NewsImage src={article.imageUrl} />
          </div>
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-gray-100 sm:h-80">
            <span className="text-sm text-gray-400">LocalNow</span>
          </div>
        )}
        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2">
            <span
              className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${NEWS_CATEGORY_COLORS[article.category]}`}
            >
              {label}
            </span>
            <span className="text-xs text-gray-500">{article.sourceName}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-gray-900 group-hover:underline sm:text-3xl">
            {article.title}
          </h1>
          {article.summary ? <p className="line-clamp-2 text-sm text-gray-600">{article.summary}</p> : null}
          <span className="text-xs text-gray-400">{formatRelativeTime(article.publishedAt)}</span>
        </div>
      </a>
      <RelatedCommerces category={article.category} city={city} />
      <div className="border-t border-gray-100 px-5 py-3">
        <BecomeCommerceButton className="text-xs text-gray-400 hover:text-gray-600 hover:underline" defaultCity={city} />
      </div>
    </article>
  );
}
