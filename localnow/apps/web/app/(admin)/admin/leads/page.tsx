import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authFetch, isNotAdmin } from '@/lib/auth-api';
import type { City, Lead } from '@/lib/types';
import { NotAdminNotice } from '../../not-admin-notice';
import { LeadRow } from './lead-row';

export default async function AdminLeadsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  let leads: Lead[];
  let cities: City[];
  try {
    [leads, cities] = await Promise.all([authFetch<Lead[]>('/admin/leads'), authFetch<City[]>('/admin/cities')]);
  } catch (error) {
    if (isNotAdmin(error)) {
      return <NotAdminNotice />;
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Leads ({leads.length})</h1>

      {leads.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Todavía no hay solicitudes de "Quiero estar en LocalNow".
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} cities={cities} />
          ))}
        </div>
      )}
    </div>
  );
}
