import type { Coupon } from '@/lib/types';

const TYPE_LABELS: Record<Coupon['type'], string> = {
  PERCENTAGE: 'Descuento',
  FIXED: 'Precio fijo',
  TWO_FOR_ONE: '2x1',
};

function formatValue(coupon: Coupon): string {
  if (coupon.type === 'PERCENTAGE') return `${coupon.value}% de descuento`;
  if (coupon.type === 'FIXED') return `${coupon.value}€ de descuento`;
  return '2x1';
}

export function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-gray-300 bg-white p-4">
      <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
        {TYPE_LABELS[coupon.type]}
      </span>
      <h3 className="font-semibold text-gray-900">{coupon.title}</h3>
      <p className="text-sm font-medium text-gray-700">{formatValue(coupon)}</p>
      {coupon.description ? <p className="text-sm text-gray-500">{coupon.description}</p> : null}
      <p className="text-xs text-gray-400">
        Válido hasta {new Date(coupon.endDate).toLocaleDateString('es-ES')}
      </p>
    </div>
  );
}
