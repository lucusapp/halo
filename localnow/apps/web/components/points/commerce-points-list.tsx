import type { CommercePointsBalance } from '@/lib/types';

export function CommercePointsList({ commerces }: { commerces: CommercePointsBalance[] }) {
  return (
    <div className="flex flex-col gap-2">
      {commerces.map((commerce) => (
        <div
          key={commerce.commerceId}
          className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
        >
          <span className="font-medium text-gray-900">{commerce.commerceName}</span>
          <span className="font-semibold text-gray-900">{commerce.balance} pts</span>
        </div>
      ))}
    </div>
  );
}
