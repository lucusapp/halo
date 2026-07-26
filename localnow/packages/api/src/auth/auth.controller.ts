import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../clerk-auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { ClerkJwtClaims } from '../clerk-auth/types';
import { CreateCommerceDto } from '../commerce/dto/create-commerce.dto';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import type { AuthCommerceResult, AuthIdentityResult, AuthUserResult } from './types';

// Todos los endpoints exigen un JWT de Clerk ya emitido: el cliente se autentica
// directamente contra Clerk con su propio SDK (signup/signin/OAuth) antes de llamar
// aquí. Este controlador nunca ve contraseñas, solo sincroniza o lee el perfil
// LocalNow correspondiente a esa identidad ya verificada.
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/user')
  registerUser(
    @CurrentUser() claims: ClerkJwtClaims,
    @Body() dto: RegisterUserDto,
  ): Promise<AuthUserResult> {
    return this.authService.registerUser(claims, dto);
  }

  @Post('register/commerce')
  registerCommerce(
    @CurrentUser() claims: ClerkJwtClaims,
    @Body() dto: CreateCommerceDto,
  ): Promise<AuthCommerceResult> {
    return this.authService.registerCommerce(claims, dto);
  }

  @Post('login')
  login(@CurrentUser() claims: ClerkJwtClaims): Promise<AuthIdentityResult> {
    return this.authService.login(claims);
  }

  @Post('refresh')
  refresh(@CurrentUser() claims: ClerkJwtClaims): Promise<AuthIdentityResult> {
    return this.authService.refresh(claims);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() claims: ClerkJwtClaims): Promise<void> {
    await this.authService.logout(claims);
  }
}
