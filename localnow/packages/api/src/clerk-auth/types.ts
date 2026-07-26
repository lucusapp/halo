import type { Request } from 'express';
import type { verifyToken } from '@clerk/backend';

// @clerk/backend no reexporta el tipo del payload verificado bajo un nombre público
// estable (vive en @clerk/shared/types, un paquete interno). Lo derivamos del propio
// verifyToken para no acoplarnos a esa ruta interna, que puede cambiar entre versiones.
export type ClerkJwtClaims = Awaited<ReturnType<typeof verifyToken>>;

// request.auth lo rellena JwtAuthGuard tras verificar el token — solo existe en
// rutas protegidas por ese guard.
export interface AuthenticatedRequest extends Request {
  auth: ClerkJwtClaims;
}
