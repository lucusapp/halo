import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { withBasePath } from '@/lib/base-path';
import { authFetch, isNotAdmin } from '@/lib/auth-api';
import type { AdminCommerce } from '@/lib/types';
import { NotAdminNotice } from '../../not-admin-notice';
import { CommerceRow } from './commerce-row';

export default async function AdminComerciosPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(withBasePath('/login'));
  }

  let commerces: AdminCommerce[];
  try {
    // Ya viene ordenado con los pendientes primero (AdminService.getCommerces).
    commerces = await authFetch<AdminCommerce[]>('/admin/commerce');
  } catch (error) {
    if (isNotAdmin(error)) {
      return <NotAdminNotice />;
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Comercios</h1>
      {commerces.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no hay comercios registrados.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {commerces.map((commerce) => (
            <CommerceRow key={commerce.id} commerce={commerce} />
          ))}
        </div>
      )}
    </div>
  );
}
