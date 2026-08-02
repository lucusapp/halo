import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authFetch, isNotAdmin } from '@/lib/auth-api';
import type { City, Segment } from '@/lib/types';
import { NotAdminNotice } from '../../not-admin-notice';
import { RecomputeForm } from './recompute-form';
import { SegmentRow } from './segment-row';

export default async function AdminSegmentosPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  let segments: Segment[];
  let cities: City[];
  try {
    [segments, cities] = await Promise.all([
      authFetch<Segment[]>('/admin/segments'),
      authFetch<City[]>('/admin/cities'),
    ]);
  } catch (error) {
    if (isNotAdmin(error)) {
      return <NotAdminNotice />;
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Segmentos</h1>

      <RecomputeForm cities={cities} />

      {segments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no hay segmentos definidos.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {segments.map((segment) => (
            <SegmentRow key={segment.id} segment={segment} />
          ))}
        </div>
      )}
    </div>
  );
}
