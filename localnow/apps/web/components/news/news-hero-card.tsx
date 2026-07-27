import { NEWS_CATEGORIES } from '@localnow/shared';
import { NEWS_CATEGORY_COLORS } from '@/lib/category-colors';
import { formatRelativeTime } from '@/lib/format';
import type { NewsArticle } from '@/lib/types';

export function NewsHeroCard({ article }: { article: NewsArticle }) {
  const label = NEWS_CATEGORIES.find((category) => category.value === article.category)?.label ?? article.category;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
    >
      {article.imageUrl ? (
        // Las imágenes vienen de fuentes RSS con dominios arbitrarios, no conocidos
        // de antemano: no se puede usar next/image (exige listar cada dominio).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.imageUrl} alt="" className="h-56 w-full object-cover sm:h-80" />
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
        <h1 className="text-xl font-bold leading-snug text-gray-900 group-hover:underline sm:text-2xl">
          {article.title}
        </h1>
        {article.summary ? <p className="line-clamp-2 text-sm text-gray-600">{article.summary}</p> : null}
        <span className="text-xs text-gray-400">{formatRelativeTime(article.publishedAt)}</span>
      </div>
    </a>
  );
}
