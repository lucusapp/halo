'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';

export interface ActionResult {
  ok: boolean;
  errorMessage?: string;
}

export async function updateCityRatioAction(id: string, pointsRatioGlobal: number): Promise<ActionResult> {
  try {
    await authFetch(`/admin/cities/${id}`, { method: 'PUT', body: JSON.stringify({ pointsRatioGlobal }) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/configuracion');
  return { ok: true };
}

export async function updateQrExpiryAction(qrExpiryMinutes: number): Promise<ActionResult> {
  try {
    await authFetch('/admin/config', { method: 'PUT', body: JSON.stringify({ qrExpiryMinutes }) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/configuracion');
  return { ok: true };
}
