'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';

export interface CreateProductActionResult {
  ok: boolean;
  errorMessage?: string;
}

export async function createProductAction(formData: FormData): Promise<CreateProductActionResult> {
  const ean = formData.get('ean')?.toString().trim() || undefined;
  const plu = formData.get('plu')?.toString().trim() || undefined;
  const imageUrl = formData.get('imageUrl')?.toString().trim() || undefined;
  const source = formData.get('source')?.toString() || undefined;

  const dto = {
    ean,
    plu,
    name: formData.get('name')?.toString().trim(),
    category: formData.get('category')?.toString().trim() || undefined,
    price: Number(formData.get('price')),
    unit: formData.get('unit')?.toString() || undefined,
    imageUrl,
    // Solo se etiqueta como OPENFOODFACTS si el lookup del cliente rellenó el
    // formulario y el comercio no lo vació — cualquier otro caso es MANUAL (el
    // valor por defecto del backend si se omite `source`).
    ...(source === 'OPENFOODFACTS' && imageUrl ? { source: 'OPENFOODFACTS' } : {}),
  };

  try {
    await authFetch('/panel/products', { method: 'POST', body: JSON.stringify(dto) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }

  revalidatePath('/panel/productos');
  revalidatePath('/panel/venta');
  return { ok: true };
}
