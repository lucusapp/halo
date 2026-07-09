import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken, type ClerkClient } from '@clerk/backend';
import type { ClerkJwtClaims } from './types';

// Única frontera con el SDK de Clerk: verificación de tokens y las dos llamadas a
// la Backend API que necesitamos (email verificado del usuario, revocar sesión).
// Mantenerlo aislado aquí para que AuthService no dependa directamente del SDK.
@Injectable()
export class ClerkService {
  private readonly clerkClient: ClerkClient;
  private readonly secretKey: string;

  constructor(configService: ConfigService) {
    this.secretKey = configService.getOrThrow<string>('CLERK_SECRET_KEY');
    this.clerkClient = createClerkClient({ secretKey: this.secretKey });
  }

  async verifyAccessToken(token: string): Promise<ClerkJwtClaims> {
    try {
      return await verifyToken(token, { secretKey: this.secretKey });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  // El JWT de sesión de Clerk no incluye el email por defecto (solo sub/sid/exp...),
  // así que lo resolvemos vía la Backend API usando el `sub` ya verificado — nunca
  // nos fiamos de un email que venga en el body de la request.
  async getPrimaryEmail(authId: string): Promise<string> {
    const user = await this.clerkClient.users.getUser(authId);
    const primaryEmail = user.emailAddresses.find(
      (address) => address.id === user.primaryEmailAddressId,
    )?.emailAddress;

    if (!primaryEmail) {
      throw new NotFoundException('La cuenta de Clerk no tiene un email principal verificado');
    }

    return primaryEmail;
  }

  // Revocación real en Clerk: cierra la sesión en todos los clientes, no un no-op local.
  async revokeSession(sessionId: string): Promise<void> {
    await this.clerkClient.sessions.revokeSession(sessionId);
  }
}
