'use client';

import { useState, useTransition } from 'react';
import { NEWS_CATEGORIES } from '@localnow/shared';
import type { NewsArticle } from '@/lib/types';
import { markFeaturedAction } from './actions';

export function ArticleRow({ article }: { article: NewsArticle }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const categoryLabel = NEWS_CATEGORIES.find((category) => category.value === article.category)?.label;

  function handleMarkFeatured() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await markFeaturedAction(article.id);
      if (!result.ok) {
        setErrorMessage(result.errorMessage ?? 'No se pudo destacar.');
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{article.title}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {article.sourceName} · {categoryLabel ?? article.category}
        </span>
        {errorMessage ? <span className="text-xs text-red-600 dark:text-red-400">{errorMessage}</span> : null}
      </div>
      {article.featured ? (
        <span className="whitespace-nowrap rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-200">
          Destacado
        </span>
      ) : (
        <button
          type="button"
          onClick={handleMarkFeatured}
          disabled={isPending}
          className="whitespace-nowrap rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
        >
          {isPending ? 'Guardando…' : 'Marcar destacado'}
        </button>
      )}
    </div>
  );
}
