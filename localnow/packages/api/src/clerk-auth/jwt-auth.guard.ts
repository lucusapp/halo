import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import type { AuthenticatedRequest } from './types';

// Protege cualquier ruta exigiendo un JWT de Clerk válido en el header Authorization.
// No decide QUIÉN es el actor en nuestra BD (User/Commerce/AdminUser) — eso lo
// resuelve cada AuthService/CommerceService a partir del `sub` verificado que este
// guard deja en request.auth.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly clerkService: ClerkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Falta el header Authorization: Bearer <token>');
    }

    request.auth = await this.clerkService.verifyAccessToken(token);
    return true;
  }

  private extractBearerToken(request: AuthenticatedRequest): string | undefined {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return undefined;
    }
    return header.slice('Bearer '.length).trim() || undefined;
  }
}
