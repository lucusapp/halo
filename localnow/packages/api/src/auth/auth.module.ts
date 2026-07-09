import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkService } from './clerk.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ClerkService, JwtAuthGuard],
  // ClerkService y JwtAuthGuard los reutilizará cualquier otro módulo que proteja
  // sus rutas con @UseGuards(JwtAuthGuard).
  exports: [ClerkService, JwtAuthGuard],
})
export class AuthModule {}
