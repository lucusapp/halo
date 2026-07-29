'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import { authFetch } from '@/lib/auth-api';

export interface ActionResult {
  ok: boolean;
  errorMessage?: string;
}

export async function createNewsSourceAction(formData: FormData): Promise<ActionResult> {
  const dto = {
    cityId: formData.get('cityId')?.toString().trim(),
    name: formData.get('name')?.toString().trim(),
    url: formData.get('url')?.toString().trim(),
    feedUrl: formData.get('feedUrl')?.toString().trim() || undefined,
    category: formData.get('category')?.toString() || undefined,
  };

  try {
    await authFetch('/admin/news-sources', { method: 'POST', body: JSON.stringify(dto) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/noticias');
  return { ok: true };
}

export async function updateNewsSourceAction(id: string, formData: FormData): Promise<ActionResult> {
  const dto = {
    name: formData.get('name')?.toString().trim(),
    url: formData.get('url')?.toString().trim(),
    feedUrl: formData.get('feedUrl')?.toString().trim() || undefined,
    category: formData.get('category')?.toString() || undefined,
  };

  try {
    await authFetch(`/admin/news-sources/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/noticias');
  return { ok: true };
}

export async function toggleNewsSourceActiveAction(id: string, active: boolean): Promise<ActionResult> {
  try {
    await authFetch(`/admin/news-sources/${id}`, { method: 'PUT', body: JSON.stringify({ active }) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/noticias');
  return { ok: true };
}

export async function markFeaturedAction(articleId: string): Promise<ActionResult> {
  try {
    await authFetch(`/admin/news/${articleId}/featured`, { method: 'PUT' });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }
  revalidatePath('/admin/noticias');
  return { ok: true };
}
