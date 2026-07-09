import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterCommerceDto } from './dto/register-commerce.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthCommerceResult, AuthIdentityResult, AuthUserResult, ClerkJwtClaims } from './types';

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
    @Body() dto: RegisterCommerceDto,
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
