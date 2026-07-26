import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../clerk-auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { ClerkJwtClaims } from '../clerk-auth/types';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import type { CouponActivationResult, CouponResult, UserActiveCouponResult } from './types';

// Rutas explícitas por §12, igual que en Transactions: /panel/coupons (comercio),
// /commerce/:id/coupons (público) y /user/coupons/* (cliente) no comparten prefijo.
@Controller()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('panel/coupons')
  @UseGuards(JwtAuthGuard)
  findByCommercePanel(@CurrentUser() claims: ClerkJwtClaims): Promise<CouponResult[]> {
    return this.couponsService.findByCommercePanel(claims.sub);
  }

  @Post('panel/coupons')
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() claims: ClerkJwtClaims, @Body() dto: CreateCouponDto): Promise<CouponResult> {
    return this.couponsService.create(claims.sub, dto);
  }

  @Put('panel/coupons/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() claims: ClerkJwtClaims,
    @Body() dto: UpdateCouponDto,
  ): Promise<CouponResult> {
    return this.couponsService.update(id, claims.sub, dto);
  }

  @Delete('panel/coupons/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() claims: ClerkJwtClaims): Promise<void> {
    return this.couponsService.remove(id, claims.sub);
  }

  @Get('commerce/:id/coupons')
  findPublicByCommerce(@Param('id') id: string): Promise<CouponResult[]> {
    return this.couponsService.findPublicByCommerce(id);
  }

  @Get('user/coupons/active')
  @UseGuards(JwtAuthGuard)
  getUserActiveCoupons(@CurrentUser() claims: ClerkJwtClaims): Promise<UserActiveCouponResult[]> {
    return this.couponsService.getUserActiveCoupons(claims.sub);
  }

  @Post('user/coupons/:id/activate')
  @UseGuards(JwtAuthGuard)
  activate(@Param('id') id: string, @CurrentUser() claims: ClerkJwtClaims): Promise<CouponActivationResult> {
    return this.couponsService.activate(claims.sub, id);
  }
}
