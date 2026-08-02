import Link from 'next/link';
import type { UserPoints } from '@/lib/types';

export function PointsSummaryCard({ points }: { points: UserPoints }) {
  return (
    <Link
      href={'/puntos'}
      className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
    >
      <div>
        <p className="text-sm text-gray-500">Puntos LocalNow</p>
        <p className="text-2xl font-bold text-gray-900">{points.global.balance}</p>
      </div>
      <span className="text-sm text-gray-400">Ver detalle →</span>
    </Link>
  );
}
