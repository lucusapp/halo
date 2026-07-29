'use client';

import { useRef, useState, useTransition } from 'react';
import { NEWS_CATEGORIES } from '@localnow/shared';
import type { City } from '@/lib/types';
import { createNewsSourceAction } from './actions';

export function CreateSourceForm({ cities }: { cities: City[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createNewsSourceAction(formData);
      if (result.ok) {
        formRef.current?.reset();
      } else {
        setErrorMessage(result.errorMessage ?? 'No se pudo crear la fuente.');
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
    >
      <h2 className="font-bold text-gray-900 dark:text-gray-100">Nueva fuente RSS</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          Nombre
          <input
            name="name"
            type="text"
            required
            className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          Ciudad
          <select
            name="cityId"
            required
            className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
        URL del sitio
        <input
          name="url"
          type="url"
          required
          placeholder="https://www.example.com"
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
        URL del feed RSS (opcional — sin esto no se rastrea automáticamente)
        <input
          name="feedUrl"
          type="url"
          placeholder="https://www.example.com/rss"
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
        Categoría de resguardo (opcional — solo se usa si ningún artículo coincide con la heurística por palabras clave)
        <select name="category" className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
          <option value="">Sin categoría de resguardo</option>
          {NEWS_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {isPending ? 'Creando…' : 'Añadir fuente'}
      </button>
    </form>
  );
}
