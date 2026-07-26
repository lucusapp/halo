import type { AdminRole } from '@localnow/shared';

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
