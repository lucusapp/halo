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
import type { AdminCommerceResult, OwnCommerceResult } from '../commerce/types';
import type { AdminCouponResult, CouponResult } from '../coupons/types';
import { CreateNewsSourceDto } from '../news/dto/create-news-source.dto';
import { UpdateNewsSourceDto } from '../news/dto/update-news-source.dto';
import type { NewsArticleResult, NewsSourceResult } from '../news/types';
import type { SegmentResult } from '../segments/types';
import { AdminService } from './admin.service';
import { RecomputeSegmentsDto } from './dto/recompute-segments.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import type { AdminUserResult, CityResult, GlobalAnalyticsResult, PlatformConfigResult } from './types';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('commerce/pending')
  getCommercesPending(): Promise<OwnCommerceResult[]> {
    return this.adminService.getCommercesPending();
  }

  @Get('commerce')
  getCommerces(): Promise<AdminCommerceResult[]> {
    return this.adminService.getCommerces();
  }

  @Put('commerce/:id/approve')
  approveCommerce(@Param('id') id: string): Promise<OwnCommerceResult> {
    return this.adminService.approveCommerce(id);
  }

  @Get('coupons/pending')
  getCouponsPending(): Promise<AdminCouponResult[]> {
    return this.adminService.getCouponsPending();
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

  @Get('users')
  getUsers(): Promise<AdminUserResult[]> {
    return this.adminService.getUsers();
  }

  @Get('cities')
  getCities(): Promise<CityResult[]> {
    return this.adminService.getCities();
  }

  @Put('cities/:id')
  updateCity(@Param('id') id: string, @Body() dto: UpdateCityDto): Promise<CityResult> {
    return this.adminService.updateCity(id, dto);
  }

  @Get('config')
  getConfig(): Promise<PlatformConfigResult> {
    return this.adminService.getConfig();
  }

  @Put('config')
  updateConfig(@Body() dto: UpdateConfigDto): Promise<PlatformConfigResult> {
    return this.adminService.updateConfig(dto);
  }
}
