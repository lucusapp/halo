'use server';

import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';
import type { SaleCreated } from '@/lib/types';

export interface SaleItemInput {
  productId?: string;
  ean?: string | null;
  plu?: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleActionResult {
  ok: boolean;
  sale?: SaleCreated;
  errorMessage?: string;
}

// Devuelve un resultado tipado en vez de lanzar: el Client Component necesita
// distinguir "el comercio no está activo todavía" (mensaje para mostrar tal cual) de
// un fallo inesperado, sin depender de volver a importar ApiError en un componente
// cliente.
export async function createSaleAction(items: SaleItemInput[]): Promise<CreateSaleActionResult> {
  if (items.length === 0) {
    return { ok: false, errorMessage: 'Añade al menos un producto antes de generar el QR.' };
  }

  try {
    const sale = await authFetch<SaleCreated>('/panel/sale/new', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    return { ok: true, sale };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
}
