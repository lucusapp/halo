import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';
import type { Ticket } from '@/lib/types';

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  let ticket: Ticket;
  try {
    ticket = await authFetch<Ticket>(`/user/tickets/${params.id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{ticket.commerceName}</h1>
        <p className="text-sm text-gray-500">
          {new Date(ticket.timestamp).toLocaleString('es-ES', {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="p-3 font-medium">Producto</th>
              <th className="p-3 text-right font-medium">Cant.</th>
              <th className="p-3 text-right font-medium">Precio</th>
              <th className="p-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {ticket.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-50 last:border-0">
                <td className="p-3 text-gray-900">{item.productName}</td>
                <td className="p-3 text-right text-gray-600">{item.quantity}</td>
                <td className="p-3 text-right text-gray-600">{item.unitPrice.toFixed(2)}€</td>
                <td className="p-3 text-right font-medium text-gray-900">{item.lineTotal.toFixed(2)}€</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-gray-100 p-3 font-semibold text-gray-900">
          <span>Total</span>
          <span>{ticket.totalAmount.toFixed(2)}€</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        <span>+{ticket.pointsGlobalEarned} puntos LocalNow</span>
        <span>
          +{ticket.pointsCommerceEarned} puntos en {ticket.commerceName}
        </span>
      </div>
    </div>
  );
}
