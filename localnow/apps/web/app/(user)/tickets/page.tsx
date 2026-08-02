import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authFetch, isUserNotRegistered } from '@/lib/auth-api';
import type { TicketSummary } from '@/lib/types';
import { CompleteRegistrationForm } from '../complete-registration-form';
import { TicketSummaryRow } from '@/components/tickets/ticket-summary-row';

export default async function TicketsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  let tickets: TicketSummary[];
  try {
    tickets = await authFetch<TicketSummary[]>('/user/tickets');
  } catch (error) {
    if (isUserNotRegistered(error)) {
      return (
        <div className="flex flex-col gap-6">
          <h1 className="text-xl font-bold text-gray-900">Mis tickets</h1>
          <CompleteRegistrationForm />
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Mis tickets</h1>
      {tickets.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no tienes compras registradas.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map((ticket) => (
            <TicketSummaryRow key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
