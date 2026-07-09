import type { Request } from 'express';
import type { verifyToken } from '@clerk/backend';
import type { AdminRole } from '@localnow/shared';

// @clerk/backend no reexporta el tipo del payload verificado bajo un nombre público
// estable (vive en @clerk/shared/types, un paquete interno). Lo derivamos del propio
// verifyToken para no acoplarnos a esa ruta interna, que puede cambiar entre versiones.
export type ClerkJwtClaims = Awaited<ReturnType<typeof verifyToken>>;

// request.auth lo rellena JwtAuthGuard tras verificar el token — solo existe en
// rutas protegidas por ese guard.
export interface AuthenticatedRequest extends Request {
  auth: ClerkJwtClaims;
}

export interface AuthUserResult {
  role: 'user';
  id: string;
  authId: string;
  email: string;
  name: string | null;
  cityId: string | null;
  pointsGlobal: {
    balance: number;
    totalEarned: number;
    totalRedeemed: number;
  };
}

export interface AuthCommerceResult {
  role: 'commerce';
  id: string;
  authId: string;
  email: string;
  name: string;
  verified: boolean;
  active: boolean;
}

export interface AuthAdminResult {
  role: 'admin';
  id: string;
  authId: string;
  email: string;
  adminRole: AdminRole;
}

// Resultado de /auth/login y /auth/refresh: la cuenta puede ser un cliente, un
// comercio o un administrador — cada uno vive en su propia tabla (§11).
export type AuthIdentityResult = AuthUserResult | AuthCommerceResult | AuthAdminResult;
