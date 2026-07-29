import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { withBasePath } from '@/lib/base-path';
import { authFetch, isNotAdmin } from '@/lib/auth-api';
import type { City, PlatformConfig } from '@/lib/types';
import { NotAdminNotice } from '../../not-admin-notice';
import { CityRatioRow } from './city-ratio-row';
import { QrExpiryForm } from './qr-expiry-form';

export default async function AdminConfiguracionPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(withBasePath('/login'));
  }

  let cities: City[];
  let config: PlatformConfig;
  try {
    [cities, config] = await Promise.all([
      authFetch<City[]>('/admin/cities'),
      authFetch<PlatformConfig>('/admin/config'),
    ]);
  } catch (error) {
    if (isNotAdmin(error)) {
      return <NotAdminNotice />;
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Configuración</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ratio de puntos globales por ciudad</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">Puntos LocalNow otorgados por cada € gastado.</p>
        <div className="flex flex-col gap-2">
          {cities.map((city) => (
            <CityRatioRow key={city.id} city={city} />
          ))}
        </div>
      </section>

      <section>
        <QrExpiryForm config={config} />
      </section>
    </div>
  );
}
