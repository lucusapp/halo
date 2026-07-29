'use client';

import { useState, useTransition } from 'react';
import type { PlatformConfig } from '@/lib/types';
import { updateQrExpiryAction } from './actions';

export function QrExpiryForm({ config }: { config: PlatformConfig }) {
  const [value, setValue] = useState(String(config.qrExpiryMinutes));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setMessage(null);
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric <= 0) {
      setMessage('Debe ser un número entero positivo de minutos.');
      return;
    }
    startTransition(async () => {
      const result = await updateQrExpiryAction(numeric);
      setMessage(result.ok ? 'Guardado.' : (result.errorMessage ?? 'No se pudo guardar.'));
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div>
        <h2 className="font-bold text-gray-900 dark:text-gray-100">Tiempo de expiración del QR</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Aplica a los QR de cupones y recompensas. El QR de venta (ticket) tiene su propio tiempo fijo de 5 minutos,
          no es configurable aquí.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          step="1"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-24 rounded border border-gray-300 px-2 py-1.5 text-right text-sm dark:border-gray-600 dark:bg-gray-900"
        />
        <span className="text-sm text-gray-500 dark:text-gray-400">minutos</span>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
        {message ? <span className="text-xs text-gray-500 dark:text-gray-400">{message}</span> : null}
      </div>
    </div>
  );
}
