import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../clerk-auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { ClerkJwtClaims } from '../clerk-auth/types';
import { CommerceService } from './commerce.service';
import { CreateCommerceDto } from './dto/create-commerce.dto';
import { FindCommerceQueryDto } from './dto/find-commerce-query.dto';
import { UpdateCommerceDto } from './dto/update-commerce.dto';
import type { OwnCommerceResult, PublicCommerceResult } from './types';

@Controller('commerce')
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @Get()
  findAll(@Query() query: FindCommerceQueryDto): Promise<PublicCommerceResult[]> {
    return this.commerceService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PublicCommerceResult> {
    return this.commerceService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() claims: ClerkJwtClaims,
    @Body() dto: CreateCommerceDto,
  ): Promise<OwnCommerceResult> {
    const commerce = await this.commerceService.create(claims.sub, dto);
    return this.commerceService.toOwnResult(commerce);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() claims: ClerkJwtClaims,
    @Body() dto: UpdateCommerceDto,
  ): Promise<OwnCommerceResult> {
    const commerce = await this.commerceService.update(id, claims.sub, dto);
    return this.commerceService.toOwnResult(commerce);
  }
}
