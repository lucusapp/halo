import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authFetch, isCommerceNotRegistered } from '@/lib/auth-api';
import type { Product } from '@/lib/types';
import { CommerceNotRegisteredNotice } from '../../commerce-not-registered-notice';
import { ProductForm } from './product-form';
import { ProductRow } from './product-row';

export default async function ProductosPage() {
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
          <h1 className="text-xl font-bold text-gray-900">Productos</h1>
          <CommerceNotRegisteredNotice />
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Productos</h1>

      <ProductForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900">Tu catálogo</h2>
        {products.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no has añadido ningún producto.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
