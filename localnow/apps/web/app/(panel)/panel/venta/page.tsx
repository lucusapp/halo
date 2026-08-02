import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authFetch, isCommerceNotRegistered } from '@/lib/auth-api';
import type { Product } from '@/lib/types';
import { CommerceNotRegisteredNotice } from '../../commerce-not-registered-notice';
import { VentaClient } from './venta-client';

export default async function VentaPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  let products: Product[];
  try {
    products = await authFetch<Product[]>('/panel/products');
  } catch (error) {
    if (isCommerceNotRegistered(error)) {
      return (
        <div className="flex flex-col gap-6">
          <h1 className="text-xl font-bold text-gray-900">Nueva venta</h1>
          <CommerceNotRegisteredNotice />
        </div>
      );
    }
    throw error;
  }

  return <VentaClient products={products} />;
}
