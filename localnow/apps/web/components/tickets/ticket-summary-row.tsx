import Link from 'next/link';
import { withBasePath } from '@/lib/base-path';
import type { TicketSummary } from '@/lib/types';

export function TicketSummaryRow({ ticket }: { ticket: TicketSummary }) {
  return (
    <Link
      href={withBasePath(`/tickets/${ticket.id}`)}
      className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-gray-900">{ticket.commerceName}</span>
        <span className="text-xs text-gray-500">
          {new Date(ticket.timestamp).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-semibold text-gray-900">{ticket.totalAmount.toFixed(2)}€</span>
        <span className="text-xs text-amber-600">+{ticket.pointsGlobalEarned} pts</span>
      </div>
    </Link>
  );
}
