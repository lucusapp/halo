'use client';

import { useState, useTransition } from 'react';
import { approveCommerceAction } from './actions';

export function ApproveCommerceButton({ commerceId }: { commerceId: string }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await approveCommerceAction(commerceId);
      if (!result.ok) {
        setErrorMessage(result.errorMessage ?? 'No se pudo aprobar.');
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="whitespace-nowrap rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {isPending ? 'Aprobando…' : 'Aprobar'}
      </button>
      {errorMessage ? <span className="text-xs text-red-600 dark:text-red-400">{errorMessage}</span> : null}
    </div>
  );
}
