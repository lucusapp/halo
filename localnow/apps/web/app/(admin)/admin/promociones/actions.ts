'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';

export interface ActionResult {
  ok: boolean;
  errorMessage?: string;
}

export async function createPromotionAction(formData: FormData): Promise<ActionResult> {
  const dto = {
    cityId: formData.get('cityId')?.toString().trim() || undefined,
    name: formData.get('name')?.toString().trim(),
    description: formData.get('description')?.toString().trim() || undefined,
    pointsMultiplier: Number(formData.get('pointsMultiplier')),
    startDate: formData.get('startDate')?.toString(),
    endDate: formData.get('endDate')?.toString(),
  };

  try {
    await authFetch('/admin/promotions', { method: 'POST', body: JSON.stringify(dto) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/promociones');
  return { ok: true };
}

export async function togglePromotionActiveAction(id: string, active: boolean): Promise<ActionResult> {
  try {
    await authFetch(`/admin/promotions/${id}`, { method: 'PUT', body: JSON.stringify({ active }) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/promociones');
  return { ok: true };
}

export async function deletePromotionAction(id: string): Promise<ActionResult> {
  try {
    await authFetch(`/admin/promotions/${id}`, { method: 'DELETE' });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/promociones');
  return { ok: true };
}
