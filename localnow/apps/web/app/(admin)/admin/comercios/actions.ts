'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';

export interface ApproveCommerceActionResult {
  ok: boolean;
  errorMessage?: string;
}

export async function approveCommerceAction(id: string): Promise<ApproveCommerceActionResult> {
  try {
    await authFetch(`/admin/commerce/${id}/approve`, { method: 'PUT' });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/comercios');
  revalidatePath('/admin');
  return { ok: true };
}
