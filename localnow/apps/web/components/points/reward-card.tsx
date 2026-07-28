import type { AvailableReward } from '@/lib/types';

export function RewardCard({ reward }: { reward: AvailableReward }) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 ${
        reward.locked ? 'bg-gray-50 opacity-60' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-gray-900">{reward.title}</span>
        {reward.locked ? (
          <span aria-hidden className="text-sm">
            🔒
          </span>
        ) : null}
      </div>
      {reward.description ? <p className="text-sm text-gray-500">{reward.description}</p> : null}
      <span className="text-sm font-medium text-gray-700">{reward.pointsCost} puntos</span>
      {reward.locked ? (
        <span className="text-xs text-gray-400">Te faltan {reward.pointsMissing} puntos</span>
      ) : (
        <span className="text-xs font-medium text-green-600">Disponible para canjear</span>
      )}
    </div>
  );
}
