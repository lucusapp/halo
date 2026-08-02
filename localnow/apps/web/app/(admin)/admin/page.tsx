import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authFetch, isNotAdmin } from '@/lib/auth-api';
import type { GlobalAnalytics } from '@/lib/types';
import { NotAdminNotice } from '../not-admin-notice';
import { MetricCard } from './metric-card';

export default async function AdminOverviewPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  let analytics: GlobalAnalytics;
  try {
    analytics = await authFetch<GlobalAnalytics>('/admin/analytics/global');
  } catch (error) {
    if (isNotAdmin(error)) {
      return <NotAdminNotice />;
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Visión general</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard label="Usuarios" value={analytics.users.total} />
        <MetricCard
          label="Comercios activos"
          value={analytics.commerces.active}
          sublabel={`${analytics.commerces.pending} pendientes de ${analytics.commerces.total} totales`}
        />
        <MetricCard
          label="Transacciones hoy"
          value={analytics.transactions.today.count}
          sublabel={`${analytics.transactions.today.totalAmount.toFixed(2)}€`}
        />
        <MetricCard
          label="Puntos emitidos"
          value={analytics.points.totalGlobalIssued}
          sublabel={`${analytics.points.totalGlobalRedeemed} canjeados`}
        />
        <MetricCard label="Ciudades activas" value={analytics.cities.active} sublabel={`${analytics.cities.total} totales`} />
        <MetricCard
          label="Cupones activos"
          value={analytics.coupons.active}
          sublabel={`${analytics.coupons.totalRedemptions} canjes · ${analytics.coupons.total} totales`}
        />
        <MetricCard
          label="Campañas activas"
          value={analytics.campaigns.active}
          sublabel={`${analytics.campaigns.totalImpressions} impresiones`}
        />
        <MetricCard
          label="Facturación total"
          value={`${analytics.transactions.totalRevenue.toFixed(2)}€`}
          sublabel={`${analytics.transactions.totalConfirmed} ventas confirmadas`}
        />
      </div>
    </div>
  );
}
