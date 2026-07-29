'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';

export interface ActionResult {
  ok: boolean;
  errorMessage?: string;
}

export async function approveCouponAction(id: string): Promise<ActionResult> {
  try {
    await authFetch(`/admin/coupons/${id}/approve`, { method: 'PUT' });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/cupones');
  return { ok: true };
}
