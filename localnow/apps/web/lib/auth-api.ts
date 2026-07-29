import { auth } from '@clerk/nextjs/server';
import { API_URL, ApiError, parseErrorMessage } from './api';

// Datos privados del usuario (puntos, tickets…): a diferencia de apiFetch, esto NUNCA
// puede pasar por la Data Cache de Next.js — esa caché indexa por URL, no por usuario,
// así que cachear aquí filtraría los datos de un usuario a la respuesta de otro.
// cache: 'no-store' fuerza a pedir siempre al backend.
export async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    throw new ApiError(401, 'No autenticado');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

// Los tres endpoints de /user/* que consume este panel (points, tickets, tickets/:id)
// exigen que ya exista un User en nuestra BD (creado vía POST /auth/register/user) —
// Clerk solo garantiza la identidad, no el perfil LocalNow. Se reconoce por este
// mensaje exacto, el mismo que lanzan PointsService/TransactionsService/RewardsService.
export function isUserNotRegistered(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404 && error.message === 'Usuario no encontrado';
}

// Igual que isUserNotRegistered pero para el lado comercio: todos los endpoints
// /panel/* (Coupons/Products/Transactions) lanzan este mismo 403 exacto cuando el
// authId no corresponde a ningún Commerce en nuestra BD.
export function isCommerceNotRegistered(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403 && error.message === 'Esta cuenta no está registrada como comercio';
}

// Solo lo lanza TransactionsService.createSale: el comercio existe pero su alta
// todavía no ha sido aprobada por un admin (§9.1) — a diferencia del resto de
// /panel/*, que sí funcionan (en modo "borrador") antes de la aprobación.
export function isCommerceNotActive(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    error.message === 'El comercio todavía no está activo — el alta debe aprobarse antes de poder vender'
  );
}

// AdminGuard (packages/api/src/clerk-auth/admin.guard.ts): el JWT es válido pero ese
// authId no tiene fila en AdminUser. No hay alta de admin autoservicio (es interna,
// manual) — a diferencia de isCommerceNotRegistered/isUserNotRegistered, aquí no
// tiene sentido ofrecer ningún formulario, solo informar.
export function isNotAdmin(error: unknown): boolean {
  return (
    error instanceof ApiError && error.status === 403 && error.message === 'Esta acción requiere permisos de administrador'
  );
}
