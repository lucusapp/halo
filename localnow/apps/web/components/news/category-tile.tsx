import Link from 'next/link';
import { NEWS_CATEGORY_TILE_COLORS } from '@/lib/category-colors';
import type { NewsArticle } from '@/lib/types';
import { NewsImage } from './news-image';

// Tarjeta "portada de revista" tipo Flipboard: nombre de categoría + titular más
// reciente superpuestos sobre una foto (si el último artículo tiene imagen) o sobre
// un color sólido saturado (si no) — nunca el pill pastel que usan las tarjetas de
// artículo, aquí el color cubre toda la tarjeta.
export function CategoryTile({
  category,
  label,
  topArticle,
}: {
  category: string;
  label: string;
  topArticle: NewsArticle;
}) {
  return (
    <Link
      href={`/?category=${category}`}
      className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-xl shadow-sm transition-transform hover:scale-[1.02]"
    >
      <div className="absolute inset-0">
        {topArticle.imageUrl ? (
          <>
            <NewsImage src={topArticle.imageUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />
          </>
        ) : (
          <div className={`h-full w-full ${NEWS_CATEGORY_TILE_COLORS[category as keyof typeof NEWS_CATEGORY_TILE_COLORS]}`} />
        )}
      </div>
      <div className="relative flex h-full flex-col justify-between p-4">
        <span className="font-sans text-lg font-black uppercase tracking-tight text-white drop-shadow-sm">
          {label}
        </span>
        <span className="line-clamp-3 font-sans text-sm font-medium text-white drop-shadow-sm">
          {topArticle.title}
        </span>
      </div>
    </Link>
  );
}
