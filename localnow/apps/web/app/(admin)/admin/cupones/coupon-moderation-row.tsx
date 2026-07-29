'use client';

import { useState, useTransition } from 'react';
import type { AdminCoupon } from '@/lib/types';
import { approveCouponAction } from './actions';

const TYPE_LABELS: Record<AdminCoupon['type'], string> = {
  PERCENTAGE: 'Descuento %',
  FIXED: 'Descuento fijo',
  TWO_FOR_ONE: '2x1',
};

export function CouponModerationRow({ coupon }: { coupon: AdminCoupon }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await approveCouponAction(coupon.id);
      if (!result.ok) {
        setErrorMessage(result.errorMessage ?? 'No se pudo aprobar.');
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-gray-900 dark:text-gray-100">{coupon.title}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {coupon.commerceName} · {TYPE_LABELS[coupon.type]} ({coupon.value}) · máx. {coupon.maxRedemptions} canjes
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(coupon.startDate).toLocaleDateString('es-ES')} – {new Date(coupon.endDate).toLocaleDateString('es-ES')}
        </span>
        {errorMessage ? <span className="text-xs text-red-600 dark:text-red-400">{errorMessage}</span> : null}
      </div>
      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending}
        className="whitespace-nowrap rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {isPending ? 'Aprobando…' : 'Aprobar'}
      </button>
    </div>
  );
}
