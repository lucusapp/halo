'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';

export interface RecomputeActionResult {
  ok: boolean;
  count?: number;
  errorMessage?: string;
}

export async function recomputeSegmentsAction(cityId: string): Promise<RecomputeActionResult> {
  try {
    const result = await authFetch<unknown[]>('/admin/segments/recompute', {
      method: 'POST',
      body: JSON.stringify(cityId ? { cityId } : {}),
    });
    revalidatePath('/admin/segmentos');
    return { ok: true, count: result.length };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
}
