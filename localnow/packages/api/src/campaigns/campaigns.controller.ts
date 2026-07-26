import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../clerk-auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { ClerkJwtClaims } from '../clerk-auth/types';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import type { CampaignResult, SendCampaignResult } from './types';

@Controller('panel/campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  findByCommercePanel(@CurrentUser() claims: ClerkJwtClaims): Promise<CampaignResult[]> {
    return this.campaignsService.findByCommercePanel(claims.sub);
  }

  @Post()
  create(@CurrentUser() claims: ClerkJwtClaims, @Body() dto: CreateCampaignDto): Promise<CampaignResult> {
    return this.campaignsService.create(claims.sub, dto);
  }

  @Put(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() claims: ClerkJwtClaims): Promise<CampaignResult> {
    return this.campaignsService.approve(id, claims.sub);
  }

  // No está en §12 — ver el comentario en CampaignsService.send.
  @Post(':id/send')
  send(@Param('id') id: string, @CurrentUser() claims: ClerkJwtClaims): Promise<SendCampaignResult> {
    return this.campaignsService.send(id, claims.sub);
  }
}
