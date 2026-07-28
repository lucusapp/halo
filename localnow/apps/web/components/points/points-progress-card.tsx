import type { AvailableReward, UserPoints } from '@/lib/types';

// La barra de progreso no representa un nivel/tier inventado (el backend no tiene
// ese concepto) — mide el avance real hacia la recompensa bloqueada más cercana,
// usando pointsMissing que ya calcula RewardsService.getAvailable.
export function PointsProgressCard({ points, rewards }: { points: UserPoints; rewards: AvailableReward[] }) {
  const nearest = rewards
    .filter((reward) => reward.locked)
    .reduce<AvailableReward | null>((closest, reward) => {
      if (!closest || reward.pointsMissing < closest.pointsMissing) return reward;
      return closest;
    }, null);

  const progress = nearest
    ? Math.min(100, Math.round((points.global.balance / (points.global.balance + nearest.pointsMissing)) * 100))
    : 100;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-gray-500">Puntos LocalNow</span>
        <span className="text-2xl font-bold text-gray-900">{points.global.balance}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      {nearest ? (
        <p className="text-xs text-gray-500">
          Te faltan {nearest.pointsMissing} puntos para &ldquo;{nearest.title}&rdquo;
        </p>
      ) : (
        <p className="text-xs text-gray-500">Ya puedes canjear todas las recompensas disponibles</p>
      )}
    </div>
  );
}
