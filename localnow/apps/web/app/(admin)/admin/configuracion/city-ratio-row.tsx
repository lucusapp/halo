'use client';

import { useState, useTransition } from 'react';
import type { City } from '@/lib/types';
import { updateCityRatioAction } from './actions';

export function CityRatioRow({ city }: { city: City }) {
  const [value, setValue] = useState(String(city.pointsRatioGlobal));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setErrorMessage(null);
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setErrorMessage('El ratio debe ser un número positivo.');
      return;
    }
    startTransition(async () => {
      const result = await updateCityRatioAction(city.id, numeric);
      if (!result.ok) {
        setErrorMessage(result.errorMessage ?? 'No se pudo guardar.');
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div>
        <span className="font-medium text-gray-900 dark:text-gray-100">{city.name}</span>
        {errorMessage ? <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          min="0"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-24 rounded border border-gray-300 px-2 py-1.5 text-right text-sm dark:border-gray-600 dark:bg-gray-900"
        />
        <span className="text-xs text-gray-400 dark:text-gray-500">pts/€</span>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
