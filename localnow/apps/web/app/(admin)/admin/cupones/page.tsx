import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { withBasePath } from '@/lib/base-path';
import { authFetch, isNotAdmin } from '@/lib/auth-api';
import type { AdminCoupon } from '@/lib/types';
import { NotAdminNotice } from '../../not-admin-notice';
import { CouponModerationRow } from './coupon-moderation-row';

export default async function AdminCuponesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(withBasePath('/login'));
  }

  let coupons: AdminCoupon[];
  try {
    coupons = await authFetch<AdminCoupon[]>('/admin/coupons/pending');
  } catch (error) {
    if (isNotAdmin(error)) {
      return <NotAdminNotice />;
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Cupones pendientes de aprobación</h1>
      {coupons.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay cupones pendientes ahora mismo.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {coupons.map((coupon) => (
            <CouponModerationRow key={coupon.id} coupon={coupon} />
          ))}
        </div>
      )}
    </div>
  );
}
