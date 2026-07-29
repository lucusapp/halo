'use client';

import { useRef, useState, useTransition } from 'react';
import type { City } from '@/lib/types';
import { createPromotionAction } from './actions';

export function PromotionForm({ cities }: { cities: City[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createPromotionAction(formData);
      if (result.ok) {
        formRef.current?.reset();
      } else {
        setErrorMessage(result.errorMessage ?? 'No se pudo crear la promoción.');
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
    >
      <div>
        <h2 className="font-bold text-gray-900 dark:text-gray-100">Nueva promoción</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Bonificación de puntos globales por período. Por ahora solo queda registrada — todavía no se aplica al
          calcular puntos ni envía notificaciones.
        </p>
      </div>

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
          Ciudad (vacío = todas)
          <select name="cityId" className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
            <option value="">Todas las ciudades</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
        Descripción (opcional)
        <textarea name="description" rows={2} className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900" />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          Multiplicador de puntos
          <input
            name="pointsMultiplier"
            type="number"
            step="0.1"
            min="1"
            required
            placeholder="2 = doble puntos"
            className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          Desde
          <input
            name="startDate"
            type="date"
            required
            className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          Hasta
          <input
            name="endDate"
            type="date"
            required
            className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          />
        </label>
      </div>

      {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {isPending ? 'Creando…' : 'Crear promoción'}
      </button>
    </form>
  );
}
