'use client';

import { useState, useTransition } from 'react';
import { NEWS_CATEGORIES } from '@localnow/shared';
import type { NewsSource } from '@/lib/types';
import { toggleNewsSourceActiveAction, updateNewsSourceAction } from './actions';

export function SourceRow({ source }: { source: NewsSource }) {
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryLabel = NEWS_CATEGORIES.find((category) => category.value === source.category)?.label;

  function handleToggleActive() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await toggleNewsSourceActiveAction(source.id, !source.active);
      if (!result.ok) {
        setErrorMessage(result.errorMessage ?? 'No se pudo actualizar.');
      }
    });
  }

  function handleEditSubmit(formData: FormData) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await updateNewsSourceAction(source.id, formData);
      if (result.ok) {
        setIsEditing(false);
      } else {
        setErrorMessage(result.errorMessage ?? 'No se pudo guardar.');
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{source.name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                source.active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {source.active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {source.feedUrl ?? 'sin feed configurado'} {categoryLabel ? `· ${categoryLabel}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing((current) => !current)}
            className="text-sm text-gray-500 hover:underline dark:text-gray-400"
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={isPending}
            className="whitespace-nowrap rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
          >
            {source.active ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>

      {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}

      {isEditing ? (
        <form action={handleEditSubmit} className="flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
              Nombre
              <input
                name="name"
                type="text"
                defaultValue={source.name}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
              Categoría de resguardo
              <select
                name="category"
                defaultValue={source.category ?? ''}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
              >
                <option value="">Sin categoría</option>
                {NEWS_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
            URL del sitio
            <input
              name="url"
              type="url"
              defaultValue={source.url}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
            URL del feed RSS
            <input
              name="feedUrl"
              type="url"
              defaultValue={source.feedUrl ?? ''}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="w-fit rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
          >
            {isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      ) : null}
    </div>
  );
}
