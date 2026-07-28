import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { withBasePath } from '@/lib/base-path';
import { authFetch, isCommerceNotRegistered } from '@/lib/auth-api';
import type { PanelDashboard } from '@/lib/types';
import { CommerceNotRegisteredNotice } from '../commerce-not-registered-notice';

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmada',
  ANONYMOUS: 'Anónima',
  PENDING: 'Pendiente',
};

export default async function PanelDashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(withBasePath('/login'));
  }

  let dashboard: PanelDashboard;
  try {
    dashboard = await authFetch<PanelDashboard>('/panel/dashboard');
  } catch (error) {
    if (isCommerceNotRegistered(error)) {
      return (
        <div className="flex flex-col gap-6">
          <h1 className="text-xl font-bold text-gray-900">Panel del comercio</h1>
          <CommerceNotRegisteredNotice />
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Hoy</h1>
        <Link
          href={withBasePath('/panel/venta')}
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Nueva venta
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <span className="text-xs text-gray-500">Ventas</span>
          <span className="text-xl font-bold text-gray-900">{dashboard.today.salesCount}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <span className="text-xs text-gray-500">Importe</span>
          <span className="text-xl font-bold text-gray-900">{dashboard.today.totalAmount.toFixed(2)}€</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <span className="text-xs text-gray-500">Puntos emitidos</span>
          <span className="text-xl font-bold text-gray-900">{dashboard.today.pointsGlobalIssued}</span>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900">Últimas ventas</h2>
        {dashboard.recentSales.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no hay ventas registradas.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {dashboard.recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">
                    {new Date(sale.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <span className="text-xs text-gray-400">{STATUS_LABELS[sale.status] ?? sale.status}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-semibold text-gray-900">{sale.totalAmount.toFixed(2)}€</span>
                  <span className="text-xs text-amber-600">+{sale.pointsGlobalEarned} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
