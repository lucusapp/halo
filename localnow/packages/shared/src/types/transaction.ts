import type { PaymentMethod, TransactionStatus } from './enums';

export interface Transaction {
  id: string;
  // nullable: puede quedar ANONYMOUS si el cliente no escanea el QR (PROYECTO.md §13.1)
  userId: string | null;
  commerceId: string;
  status: TransactionStatus;
  timestamp: Date;
  totalAmount: number;
  paymentMethod: PaymentMethod | null;
  pointsGlobalEarned: number;
  pointsCommerceEarned: number;
  campaignId: string | null;
  ticketUrl: string | null;
  qrToken: string | null;
  qrExpiresAt: Date | null;
  createdAt: Date;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  // nullable: el producto pudo borrarse del catálogo tras la venta
  productId: string | null;
  ean: string | null;
  plu: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}
