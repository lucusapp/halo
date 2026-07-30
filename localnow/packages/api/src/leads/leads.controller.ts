import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../clerk-auth/admin.guard';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { OwnCommerceResult } from '../commerce/types';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ScrapeBusinessDto } from './dto/scrape-business.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadsService } from './leads.service';
import type { LeadResult, ScrapedBusinessResult } from './types';

// Mezcla rutas públicas (POST /leads, el formulario "Quiero estar en LocalNow") y
// de admin (/admin/leads/*) en un mismo controller — igual que Coupons mezcla
// /commerce/:id/coupons público con /panel/coupons privado: los guards van por
// método, no a nivel de clase.
@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('leads')
  create(@Body() dto: CreateLeadDto): Promise<LeadResult> {
    return this.leadsService.create(dto);
  }

  @Get('admin/leads')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll(): Promise<LeadResult[]> {
    return this.leadsService.findAll();
  }

  @Put('admin/leads/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeadStatusDto): Promise<LeadResult> {
    return this.leadsService.updateStatus(id, dto.status);
  }

  @Post('admin/leads/scrape')
  @UseGuards(JwtAuthGuard, AdminGuard)
  scrape(@Body() dto: ScrapeBusinessDto): Promise<ScrapedBusinessResult> {
    return this.leadsService.scrapeBusiness(dto.url);
  }

  @Post('admin/leads/:id/convert')
  @UseGuards(JwtAuthGuard, AdminGuard)
  convert(@Param('id') id: string, @Body() dto: ConvertLeadDto): Promise<OwnCommerceResult> {
    return this.leadsService.convertToCommerce(id, dto);
  }
}
