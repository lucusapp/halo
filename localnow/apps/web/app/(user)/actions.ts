'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { API_URL, ApiError, parseErrorMessage } from '@/lib/api';
import { withBasePath } from '@/lib/base-path';

// Clerk solo garantiza la identidad; el perfil LocalNow (User, con su fila de puntos
// y el consentimiento RGPD de §14) se crea aparte, vía POST /auth/register/user. No
// se hace automáticamente al iniciar sesión porque consentDataUsage es una decisión
// explícita del usuario, no algo que podamos asumir en su nombre.
export async function completeRegistration(formData: FormData): Promise<void> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    redirect(withBasePath('/login'));
  }

  const consentDataUsage = formData.get('consentDataUsage') === 'on';
  const name = formData.get('name')?.toString().trim();

  const response = await fetch(`${API_URL}/auth/register/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ consentDataUsage, ...(name ? { name } : {}) }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  revalidatePath('/dashboard');
  revalidatePath('/tickets');
  revalidatePath('/puntos');
}
