import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { JwtAuthGuard } from './jwt-auth.guard';

// Infraestructura de verificación de JWT de Clerk (guard + service), separada de
// AuthModule (login/registro/logout) para que cualquier módulo que proteja rutas
// con JwtAuthGuard pueda importar esto directamente sin depender de AuthModule —
// AuthModule a su vez importa CommerceModule para delegar el alta de comercios, así
// que si CommerceModule necesitara importar AuthModule para el guard, sería un ciclo.
@Module({
  providers: [ClerkService, JwtAuthGuard],
  exports: [ClerkService, JwtAuthGuard],
})
export class ClerkAuthModule {}
