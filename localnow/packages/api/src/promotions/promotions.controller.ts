import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../clerk-auth/admin.guard';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionsService } from './promotions.service';
import type { PromotionResult } from './types';

@Controller('admin/promotions')
@UseGuards(JwtAuthGuard, AdminGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  findAll(): Promise<PromotionResult[]> {
    return this.promotionsService.findAll();
  }

  @Post()
  create(@Body() dto: CreatePromotionDto): Promise<PromotionResult> {
    return this.promotionsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto): Promise<PromotionResult> {
    return this.promotionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.promotionsService.remove(id);
  }
}
