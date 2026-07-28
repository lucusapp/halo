import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../clerk-auth/admin.guard';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { OwnCommerceResult } from '../commerce/types';
import type { CouponResult } from '../coupons/types';
import { CreateNewsSourceDto } from '../news/dto/create-news-source.dto';
import { UpdateNewsSourceDto } from '../news/dto/update-news-source.dto';
import type { NewsArticleResult, NewsSourceResult } from '../news/types';
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

  @Get('news-sources')
  getNewsSources(): Promise<NewsSourceResult[]> {
    return this.adminService.getNewsSources();
  }

  @Post('news-sources')
  createNewsSource(@Body() dto: CreateNewsSourceDto): Promise<NewsSourceResult> {
    return this.adminService.createNewsSource(dto);
  }

  @Put('news-sources/:id')
  updateNewsSource(@Param('id') id: string, @Body() dto: UpdateNewsSourceDto): Promise<NewsSourceResult> {
    return this.adminService.updateNewsSource(id, dto);
  }

  @Delete('news-sources/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNewsSource(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteNewsSource(id);
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
