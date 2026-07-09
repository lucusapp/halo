import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, ClerkJwtClaims } from '../types';

// Lee los claims que JwtAuthGuard verificó y dejó en request.auth. Solo válido en
// rutas protegidas por JwtAuthGuard — sin el guard, request.auth no existe.
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ClerkJwtClaims => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.auth;
  },
);
