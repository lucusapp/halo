'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';

export interface CreateCouponActionResult {
  ok: boolean;
  errorMessage?: string;
}

export async function createCouponAction(formData: FormData): Promise<CreateCouponActionResult> {
  const dto = {
    title: formData.get('title')?.toString().trim(),
    description: formData.get('description')?.toString().trim() || undefined,
    type: formData.get('type')?.toString(),
    value: Number(formData.get('value')),
    startDate: formData.get('startDate')?.toString(),
    endDate: formData.get('endDate')?.toString(),
    maxRedemptions: Number(formData.get('maxRedemptions')),
  };

  try {
    await authFetch('/panel/coupons', { method: 'POST', body: JSON.stringify(dto) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }

  revalidatePath('/panel/cupones');
  return { ok: true };
}
