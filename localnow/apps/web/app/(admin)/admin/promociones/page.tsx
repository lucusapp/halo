import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authFetch, isNotAdmin } from '@/lib/auth-api';
import type { City, Promotion } from '@/lib/types';
import { NotAdminNotice } from '../../not-admin-notice';
import { PromotionForm } from './promotion-form';
import { PromotionRow } from './promotion-row';

export default async function AdminPromocionesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  let promotions: Promotion[];
  let cities: City[];
  try {
    [promotions, cities] = await Promise.all([
      authFetch<Promotion[]>('/admin/promotions'),
      authFetch<City[]>('/admin/cities'),
    ]);
  } catch (error) {
    if (isNotAdmin(error)) {
      return <NotAdminNotice />;
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Promociones de plataforma</h1>

      <PromotionForm cities={cities} />

      {promotions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no hay promociones creadas.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {promotions.map((promotion) => (
            <PromotionRow key={promotion.id} promotion={promotion} />
          ))}
        </div>
      )}
    </div>
  );
}
