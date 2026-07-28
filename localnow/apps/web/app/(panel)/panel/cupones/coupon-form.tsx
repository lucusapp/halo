'use client';

import { useRef, useState, useTransition } from 'react';
import { createCouponAction } from './actions';

const TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'Descuento %' },
  { value: 'FIXED', label: 'Descuento fijo (€)' },
  { value: 'TWO_FOR_ONE', label: '2x1' },
];

export function CouponForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createCouponAction(formData);
      if (result.ok) {
        formRef.current?.reset();
      } else {
        setErrorMessage(result.errorMessage ?? 'No se pudo crear el cupón.');
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
    >
      <h2 className="font-bold text-gray-900">Nuevo cupón</h2>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Título
        <input name="title" type="text" required maxLength={150} className="rounded border border-gray-300 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Descripción (opcional)
        <textarea name="description" rows={2} className="rounded border border-gray-300 px-3 py-2" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Tipo
          <select name="type" required defaultValue="PERCENTAGE" className="rounded border border-gray-300 px-3 py-2">
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Valor
          <input name="value" type="number" step="0.01" min="0" required className="rounded border border-gray-300 px-3 py-2" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Desde
          <input name="startDate" type="date" required className="rounded border border-gray-300 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Hasta
          <input name="endDate" type="date" required className="rounded border border-gray-300 px-3 py-2" />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Máximo de canjes
        <input
          name="maxRedemptions"
          type="number"
          min="1"
          step="1"
          required
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? 'Creando…' : 'Crear cupón (queda pendiente de aprobación)'}
      </button>
    </form>
  );
}
