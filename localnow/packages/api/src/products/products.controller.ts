import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../clerk-auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { ClerkJwtClaims } from '../clerk-auth/types';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import type { ProductResult } from './types';

@Controller('panel/products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@CurrentUser() claims: ClerkJwtClaims): Promise<ProductResult[]> {
    return this.productsService.findByCommercePanel(claims.sub);
  }

  @Post()
  create(@CurrentUser() claims: ClerkJwtClaims, @Body() dto: CreateProductDto): Promise<ProductResult> {
    return this.productsService.create(claims.sub, dto);
  }
}
