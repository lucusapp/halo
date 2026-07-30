'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';
import type { PublicCommerce, ScrapedBusiness } from '@/lib/types';

export interface ActionResult {
  ok: boolean;
  errorMessage?: string;
}

export async function updateLeadStatusAction(id: string, status: string): Promise<ActionResult> {
  try {
    await authFetch(`/admin/leads/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/leads');
  return { ok: true };
}

export interface ScrapeActionResult {
  ok: boolean;
  data?: ScrapedBusiness;
  errorMessage?: string;
}

export async function scrapeBusinessAction(url: string): Promise<ScrapeActionResult> {
  try {
    const data = await authFetch<ScrapedBusiness>('/admin/leads/scrape', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
}

export interface ConvertActionResult {
  ok: boolean;
  commerce?: PublicCommerce;
  errorMessage?: string;
}

export async function convertLeadAction(leadId: string, formData: FormData): Promise<ConvertActionResult> {
  const dto = {
    name: formData.get('name')?.toString().trim(),
    description: formData.get('description')?.toString().trim() || undefined,
    phone: formData.get('phone')?.toString().trim() || undefined,
    address: formData.get('address')?.toString().trim(),
    email: formData.get('email')?.toString().trim(),
    imageUrl: formData.get('imageUrl')?.toString().trim() || undefined,
    category: formData.get('category')?.toString(),
    cityId: formData.get('cityId')?.toString(),
  };

  try {
    const commerce = await authFetch<PublicCommerce>(`/admin/leads/${leadId}/convert`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    revalidatePath('/admin/leads');
    revalidatePath('/admin/comercios');
    return { ok: true, commerce };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
}
