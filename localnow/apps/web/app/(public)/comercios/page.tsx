import { COMMERCE_CATEGORIES } from '@localnow/shared';
import { apiFetch } from '@/lib/api';
import type { PublicCommerce } from '@/lib/types';
import { CategoryPills } from '@/components/ui/category-pills';
import { CommerceCard } from '@/components/commerce/commerce-card';
import { BecomeCommerceButton } from '@/components/leads/become-commerce-button';

interface CommerceDirectoryPageProps {
  searchParams: { city?: string; category?: string };
}

export default async function CommerceDirectoryPage({ searchParams }: CommerceDirectoryPageProps) {
  const query = new URLSearchParams();
  if (searchParams.city) query.set('city', searchParams.city);
  if (searchParams.category) query.set('category', searchParams.category);

  const commerces = await apiFetch<PublicCommerce[]>(`/commerce?${query.toString()}`);

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Directorio de comercios</h1>
      <CategoryPills categories={COMMERCE_CATEGORIES} activeValue={searchParams.category} basePath="/comercios" />
      {commerces.length === 0 ? (
        <p className="py-12 text-center text-gray-500">Todavía no hay comercios en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {commerces.map((commerce) => (
            <CommerceCard key={commerce.id} commerce={commerce} />
          ))}
        </div>
      )}

      <footer className="flex flex-col items-center gap-2 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
        <p className="font-serif text-lg font-bold text-gray-900">¿Tienes un negocio en la ciudad?</p>
        <p className="max-w-md text-sm text-gray-500">
          Únete al directorio de LocalNow y llega a más clientes de tu ciudad.
        </p>
        <BecomeCommerceButton className="mt-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800" defaultCity={searchParams.city} />
      </footer>
    </main>
  );
}
