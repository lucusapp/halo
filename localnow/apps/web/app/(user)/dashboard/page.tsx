import Link from 'next/link';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { withBasePath } from '@/lib/base-path';
import { authFetch, isUserNotRegistered } from '@/lib/auth-api';
import type { TicketSummary, UserPoints } from '@/lib/types';
import { CompleteRegistrationForm } from '../complete-registration-form';
import { PointsSummaryCard } from '@/components/points/points-summary-card';
import { TicketSummaryRow } from '@/components/tickets/ticket-summary-row';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(withBasePath('/login'));
  }

  const user = await currentUser();

  let points: UserPoints;
  let tickets: TicketSummary[];
  try {
    [points, tickets] = await Promise.all([
      authFetch<UserPoints>('/user/points'),
      authFetch<TicketSummary[]>('/user/tickets'),
    ]);
  } catch (error) {
    if (isUserNotRegistered(error)) {
      return (
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-900">Hola{user?.firstName ? `, ${user.firstName}` : ''}</h1>
          <CompleteRegistrationForm />
        </div>
      );
    }
    throw error;
  }

  const recentTickets = tickets.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{user?.fullName ?? user?.firstName ?? 'Mi cuenta'}</h1>
        <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>

      <PointsSummaryCard points={points} />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Últimos tickets</h2>
          <Link href={withBasePath('/tickets')} className="text-sm text-gray-500 underline">
            Ver todos
          </Link>
        </div>
        {recentTickets.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no tienes compras registradas.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentTickets.map((ticket) => (
              <TicketSummaryRow key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
