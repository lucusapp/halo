import { notFound } from 'next/navigation';
import { COMMERCE_CATEGORIES } from '@localnow/shared';
import { apiFetch, ApiError } from '@/lib/api';
import type { Coupon, PublicCommerce } from '@/lib/types';
import { CouponCard } from '@/components/commerce/coupon-card';

export default async function CommerceProfilePage({ params }: { params: { id: string } }) {
  let commerce: PublicCommerce;
  try {
    commerce = await apiFetch<PublicCommerce>(`/commerce/${params.id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const coupons = await apiFetch<Coupon[]>(`/commerce/${params.id}/coupons`).catch(() => []);
  const label =
    COMMERCE_CATEGORIES.find((category) => category.value === commerce.category)?.label ?? commerce.category;

  return (
    <main className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        {commerce.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={commerce.logoUrl} alt="" className="h-48 w-full object-cover" />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-gray-100">
            <span className="text-4xl font-bold text-gray-300">{commerce.name.charAt(0)}</span>
          </div>
        )}
        <div className="flex flex-col gap-2 p-6">
          <span className="w-fit rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-semibold text-white">
            {label}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{commerce.name}</h1>
          {commerce.description ? <p className="text-gray-600">{commerce.description}</p> : null}
          <dl className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-500 sm:grid-cols-2">
            <div>
              <dt className="inline font-medium text-gray-700">Dirección: </dt>
              <dd className="inline">{commerce.address}</dd>
            </div>
            {commerce.phone ? (
              <div>
                <dt className="inline font-medium text-gray-700">Teléfono: </dt>
                <dd className="inline">{commerce.phone}</dd>
              </div>
            ) : null}
            <div>
              <dt className="inline font-medium text-gray-700">Email: </dt>
              <dd className="inline">{commerce.email}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">Cupones activos</h2>
        {coupons.length === 0 ? (
          <p className="text-sm text-gray-500">Este comercio no tiene cupones activos ahora mismo.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
