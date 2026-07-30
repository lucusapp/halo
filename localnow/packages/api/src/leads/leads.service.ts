import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommerceLead as PrismaCommerceLead, LeadStatus as PrismaLeadStatus } from '@prisma/client';
import { LeadStatus } from '@localnow/shared';
import { CommerceService } from '../commerce/commerce.service';
import type { OwnCommerceResult } from '../commerce/types';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { PrismaService } from '../prisma/prisma.service';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { scrapeBusinessUrl } from './scrape-business.util';
import type { LeadResult, ScrapedBusinessResult } from './types';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commerceService: CommerceService,
  ) {}

  // POST /leads (público) — botón "Quiero estar en LocalNow" (§9.4, nivel 1).
  async create(dto: CreateLeadDto): Promise<LeadResult> {
    const lead = await this.prisma.commerceLead.create({
      data: {
        name: dto.name,
        businessName: dto.businessName,
        phone: dto.phone,
        email: dto.email,
        message: dto.message ?? null,
        city: dto.city,
      },
    });
    return this.toResult(lead);
  }

  async findAll(): Promise<LeadResult[]> {
    const leads = await this.prisma.commerceLead.findMany({ orderBy: { createdAt: 'desc' } });
    return leads.map((lead) => this.toResult(lead));
  }

  async updateStatus(id: string, status: LeadStatus): Promise<LeadResult> {
    await this.assertLead(id);
    const updated = await this.prisma.commerceLead.update({
      where: { id },
      data: { status: mirrorEnum<PrismaLeadStatus>(status) },
    });
    return this.toResult(updated);
  }

  // POST /admin/leads/scrape — no toca ningún lead concreto, es un paso de vista
  // previa (§9.4): el admin escanea una URL, revisa/edita el resultado y solo
  // entonces confirma con convertToCommerce. Un fallo aquí es normal (sitio caído,
  // bloquea bots, sin metaetiquetas) — se deja como BadRequest para que el admin
  // rellene a mano, no se reintenta ni se inventa nada.
  async scrapeBusiness(url: string): Promise<ScrapedBusinessResult> {
    try {
      return await scrapeBusinessUrl(url);
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'No se pudo escanear esa URL');
    }
  }

  // POST /admin/leads/:id/convert — crea el comercio de verdad (vía
  // CommerceService.createFromLead, sin authId/cif todavía) y marca el lead como
  // convertido. El comerciante no ha tenido que hacer nada: es el admin quien
  // revisó el scraping y confirmó los datos.
  async convertToCommerce(leadId: string, dto: ConvertLeadDto): Promise<OwnCommerceResult> {
    await this.assertLead(leadId);
    const commerce = await this.commerceService.createFromLead(dto);
    await this.prisma.commerceLead.update({ where: { id: leadId }, data: { status: 'CONVERTED' } });
    return this.commerceService.toOwnResult(commerce);
  }

  private async assertLead(id: string): Promise<PrismaCommerceLead> {
    const lead = await this.prisma.commerceLead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Lead no encontrado');
    }
    return lead;
  }

  private toResult(lead: PrismaCommerceLead): LeadResult {
    return {
      id: lead.id,
      name: lead.name,
      businessName: lead.businessName,
      phone: lead.phone,
      email: lead.email,
      message: lead.message,
      city: lead.city,
      status: mirrorEnum<LeadStatus>(lead.status),
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }
}
