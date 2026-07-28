import type { Coupon } from '@/lib/types';

const STATUS_STYLES: Record<Coupon['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<Coupon['status'], string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente de aprobación',
  ACTIVE: 'Activo',
  EXPIRED: 'Caducado',
};

function formatValue(coupon: Coupon): string {
  if (coupon.type === 'PERCENTAGE') return `${coupon.value}%`;
  if (coupon.type === 'FIXED') return `${coupon.value}€`;
  return '2x1';
}

export function CouponPanelRow({ coupon }: { coupon: Coupon }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-gray-900">{coupon.title}</span>
        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[coupon.status]}`}>
          {STATUS_LABELS[coupon.status]}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{formatValue(coupon)}</span>
        <span>
          {coupon.currentRedemptions}/{coupon.maxRedemptions} canjes
        </span>
      </div>
      <span className="text-xs text-gray-400">
        {new Date(coupon.startDate).toLocaleDateString('es-ES')} – {new Date(coupon.endDate).toLocaleDateString('es-ES')}
      </span>
    </div>
  );
}
