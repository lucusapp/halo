'use client';

import { useState, useTransition } from 'react';
import type { City } from '@/lib/types';
import { recomputeSegmentsAction } from './actions';

export function RecomputeForm({ cities }: { cities: City[] }) {
  const [cityId, setCityId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setMessage(null);
    startTransition(async () => {
      const result = await recomputeSegmentsAction(cityId);
      if (result.ok) {
        setMessage(`Recalculados ${result.count} segmentos.`);
      } else {
        setMessage(result.errorMessage ?? 'No se pudo recalcular.');
      }
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
        Ciudad
        <select
          value={cityId}
          onChange={(event) => setCityId(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
        >
          <option value="">Todas las ciudades</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {isPending ? 'Recalculando…' : 'Forzar recomputo'}
      </button>
      {message ? <span className="text-sm text-gray-500 dark:text-gray-400">{message}</span> : null}
    </div>
  );
}
