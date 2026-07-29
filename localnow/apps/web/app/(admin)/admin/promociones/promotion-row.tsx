'use client';

import { useState, useTransition } from 'react';
import type { Promotion } from '@/lib/types';
import { deletePromotionAction, togglePromotionActiveAction } from './actions';

export function PromotionRow({ promotion }: { promotion: Promotion }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await togglePromotionActiveAction(promotion.id, !promotion.active);
      if (!result.ok) setErrorMessage(result.errorMessage ?? 'No se pudo actualizar.');
    });
  }

  function handleDelete() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await deletePromotionAction(promotion.id);
      if (!result.ok) setErrorMessage(result.errorMessage ?? 'No se pudo borrar.');
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{promotion.name}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              promotion.active
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {promotion.active ? 'Activa' : 'Pausada'}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          x{promotion.pointsMultiplier} puntos · {promotion.cityName ?? 'Todas las ciudades'}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(promotion.startDate).toLocaleDateString('es-ES')} –{' '}
          {new Date(promotion.endDate).toLocaleDateString('es-ES')}
        </span>
        {errorMessage ? <span className="text-xs text-red-600 dark:text-red-400">{errorMessage}</span> : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className="whitespace-nowrap rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
        >
          {promotion.active ? 'Pausar' : 'Activar'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="whitespace-nowrap rounded-full border border-red-200 px-3 py-1 text-sm text-red-600 disabled:opacity-50 dark:border-red-900 dark:text-red-400"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}
