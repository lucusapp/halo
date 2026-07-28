import type { PaymentMethod, TransactionStatus } from '@localnow/shared';

// Respuesta de POST /panel/sale/new: lo que el comercio necesita para pintar el QR
// en pantalla (§13.1, pasos 3-5).
export interface SaleCreatedResult {
  transactionId: string;
  qrToken: string;
  qrExpiresAt: Date;
  totalAmount: number;
}

export interface TicketItemResult {
  productId: string | null;
  ean: string | null;
  plu: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// Ticket completo (§7.3) — GET /user/tickets/:id y respuesta de confirmar un escaneo.
export interface TicketResult {
  id: string;
  commerceId: string;
  commerceName: string;
  commerceSlug: string;
  status: TransactionStatus;
  timestamp: Date;
  totalAmount: number;
  paymentMethod: PaymentMethod | null;
  pointsGlobalEarned: number;
  pointsCommerceEarned: number;
  items: TicketItemResult[];
}

// GET /user/tickets: mismo shape sin el desglose de productos, para el listado.
export type TicketSummaryResult = Omit<TicketResult, 'items'>;
