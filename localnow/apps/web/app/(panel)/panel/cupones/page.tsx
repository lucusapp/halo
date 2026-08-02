import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authFetch, isCommerceNotRegistered } from '@/lib/auth-api';
import type { Coupon } from '@/lib/types';
import { CommerceNotRegisteredNotice } from '../../commerce-not-registered-notice';
import { CouponForm } from './coupon-form';
import { CouponPanelRow } from './coupon-panel-row';

export default async function CuponesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  let coupons: Coupon[];
  try {
    coupons = await authFetch<Coupon[]>('/panel/coupons');
  } catch (error) {
    if (isCommerceNotRegistered(error)) {
      return (
        <div className="flex flex-col gap-6">
          <h1 className="text-xl font-bold text-gray-900">Cupones</h1>
          <CommerceNotRegisteredNotice />
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Cupones</h1>

      <CouponForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900">Tus cupones</h2>
        {coupons.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no has creado ningún cupón.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {coupons.map((coupon) => (
              <CouponPanelRow key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
