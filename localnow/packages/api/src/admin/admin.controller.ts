import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../clerk-auth/admin.guard';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { OwnCommerceResult } from '../commerce/types';
import type { CouponResult } from '../coupons/types';
import type { NewsArticleResult } from '../news/types';
import type { SegmentResult } from '../segments/types';
import { AdminService } from './admin.service';
import { RecomputeSegmentsDto } from './dto/recompute-segments.dto';
import type { GlobalAnalyticsResult } from './types';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('commerce/pending')
  getCommercesPending(): Promise<OwnCommerceResult[]> {
    return this.adminService.getCommercesPending();
  }

  @Put('commerce/:id/approve')
  approveCommerce(@Param('id') id: string): Promise<OwnCommerceResult> {
    return this.adminService.approveCommerce(id);
  }

  @Put('coupons/:id/approve')
  approveCoupon(@Param('id') id: string): Promise<CouponResult> {
    return this.adminService.approveCoupon(id);
  }

  @Put('news/:id/featured')
  markArticleFeatured(@Param('id') id: string): Promise<NewsArticleResult> {
    return this.adminService.markArticleFeatured(id);
  }

  @Get('analytics/global')
  getGlobalAnalytics(): Promise<GlobalAnalyticsResult> {
    return this.adminService.getGlobalAnalytics();
  }

  @Post('segments/recompute')
  recomputeSegments(@Body() dto: RecomputeSegmentsDto): Promise<SegmentResult[]> {
    return this.adminService.recomputeSegments(dto.cityId);
  }
}
