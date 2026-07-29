import type { AdminCommerce } from '@/lib/types';
import { ApproveCommerceButton } from './approve-commerce-button';

const SUBSCRIPTION_LABELS: Record<AdminCommerce['subscriptionStatus'], string> = {
  INACTIVE: 'Sin suscripción',
  ACTIVE: 'Activa',
  PAST_DUE: 'Pago pendiente',
  CANCELED: 'Cancelada',
};

export function CommerceRow({ commerce }: { commerce: AdminCommerce }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 shadow-sm ring-1 dark:bg-gray-800 ${
        commerce.active
          ? 'bg-white ring-gray-200 dark:ring-gray-700'
          : 'bg-amber-50 ring-amber-200 dark:bg-amber-950/30 dark:ring-amber-900'
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{commerce.name}</span>
          {!commerce.active ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-200">
              Pendiente de aprobación
            </span>
          ) : null}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {commerce.category} · CIF {commerce.cif} · {commerce.email}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Suscripción: {SUBSCRIPTION_LABELS[commerce.subscriptionStatus]}
          {commerce.subscriptionPlan ? ` (${commerce.subscriptionPlan})` : ''}
        </span>
      </div>
      {!commerce.active ? <ApproveCommerceButton commerceId={commerce.id} /> : null}
    </div>
  );
}
