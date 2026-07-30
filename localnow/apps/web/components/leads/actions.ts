'use server';

import { ApiError, apiPost } from '@/lib/api';

export interface CreateLeadActionResult {
  ok: boolean;
  errorMessage?: string;
}

// POST /leads — público, sin auth. Botón "Quiero estar en LocalNow" del directorio
// y de las tarjetas de noticia (§9.4, nivel 1).
export async function createLeadAction(formData: FormData): Promise<CreateLeadActionResult> {
  const dto = {
    name: formData.get('name')?.toString().trim(),
    businessName: formData.get('businessName')?.toString().trim(),
    phone: formData.get('phone')?.toString().trim(),
    email: formData.get('email')?.toString().trim(),
    message: formData.get('message')?.toString().trim() || undefined,
    city: formData.get('city')?.toString().trim(),
  };

  try {
    await apiPost('/leads', dto);
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errorMessage: error.message };
    }
    throw error;
  }

  return { ok: true };
}
