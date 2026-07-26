import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedRequest } from './types';

// Se aplica DESPUÉS de JwtAuthGuard (@UseGuards(JwtAuthGuard, AdminGuard)): ese ya
// dejó los claims verificados en request.auth, aquí solo comprobamos que ese authId
// corresponde a un AdminUser real — cualquier otro JWT válido (User o Commerce) se
// rechaza igual que si no estuviera autenticado.
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.auth) {
      throw new UnauthorizedException('Falta autenticación');
    }
    const admin = await this.prisma.adminUser.findUnique({ where: { authId: request.auth.sub } });
    if (!admin) {
      throw new ForbiddenException('Esta acción requiere permisos de administrador');
    }
    return true;
  }
}
