import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { withBasePath } from '@/lib/base-path';
import { authFetch, isUserNotRegistered } from '@/lib/auth-api';
import type { AvailableReward, UserPoints } from '@/lib/types';
import { CompleteRegistrationForm } from '../complete-registration-form';
import { PointsProgressCard } from '@/components/points/points-progress-card';
import { CommercePointsList } from '@/components/points/commerce-points-list';
import { RewardCard } from '@/components/points/reward-card';

export default async function PuntosPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(withBasePath('/login'));
  }

  let points: UserPoints;
  let rewards: AvailableReward[];
  try {
    [points, rewards] = await Promise.all([
      authFetch<UserPoints>('/user/points'),
      authFetch<AvailableReward[]>('/user/rewards/available'),
    ]);
  } catch (error) {
    if (isUserNotRegistered(error)) {
      return (
        <div className="flex flex-col gap-6">
          <h1 className="text-xl font-bold text-gray-900">Mis puntos</h1>
          <CompleteRegistrationForm />
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Mis puntos</h1>

      <PointsProgressCard points={points} rewards={rewards} />

      {points.commerces.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-900">Puntos por comercio</h2>
          <CommercePointsList commerces={points.commerces} />
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900">Recompensas disponibles</h2>
        {rewards.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no hay recompensas configuradas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
