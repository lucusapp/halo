import { Injectable, NotFoundException } from '@nestjs/common';
import { CommerceService } from '../commerce/commerce.service';
import type { AdminCommerceResult, OwnCommerceResult } from '../commerce/types';
import { CouponsService } from '../coupons/coupons.service';
import type { AdminCouponResult, CouponResult } from '../coupons/types';
import { CreateNewsSourceDto } from '../news/dto/create-news-source.dto';
import { UpdateNewsSourceDto } from '../news/dto/update-news-source.dto';
import { NewsService } from '../news/news.service';
import type { NewsArticleResult, NewsSourceResult } from '../news/types';
import { PrismaService } from '../prisma/prisma.service';
import { SegmentsService } from '../segments/segments.service';
import type { SegmentResult } from '../segments/types';
import { UpdateCityDto } from './dto/update-city.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import type { AdminUserResult, CityResult, GlobalAnalyticsResult, PlatformConfigResult } from './types';

// El módulo Admin no reimplementa nada: conecta acciones de moderación que ya
// existían como métodos "listos, sin endpoint todavía" en sus propios servicios
// (CommerceService.approve, CouponsService.approve, NewsService.markFeatured,
// SegmentsService.recompute) — mismo patrón documentado en cada uno de ellos desde
// que se escribieron. Usuarios/ciudades/config son la excepción: no tienen un
// dominio propio (igual que getGlobalAnalytics ya hacía), así que se consultan
// directamente aquí.
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commerceService: CommerceService,
    private readonly couponsService: CouponsService,
    private readonly newsService: NewsService,
    private readonly segmentsService: SegmentsService,
  ) {}

  async getCommercesPending(): Promise<OwnCommerceResult[]> {
    return this.commerceService.findPending();
  }

  async getCommerces(): Promise<AdminCommerceResult[]> {
    return this.commerceService.findAllForAdmin();
  }

  async approveCommerce(id: string): Promise<OwnCommerceResult> {
    const commerce = await this.commerceService.approve(id);
    return this.commerceService.toOwnResult(commerce);
  }

  async getCouponsPending(): Promise<AdminCouponResult[]> {
    return this.couponsService.findPending();
  }

  async approveCoupon(id: string): Promise<CouponResult> {
    return this.couponsService.approve(id);
  }

  async markArticleFeatured(id: string): Promise<NewsArticleResult> {
    return this.newsService.markFeatured(id);
  }

  async getNewsSources(): Promise<NewsSourceResult[]> {
    return this.newsService.findAllSources();
  }

  async createNewsSource(dto: CreateNewsSourceDto): Promise<NewsSourceResult> {
    return this.newsService.createSource(dto);
  }

  async updateNewsSource(id: string, dto: UpdateNewsSourceDto): Promise<NewsSourceResult> {
    return this.newsService.updateSource(id, dto);
  }

  async deleteNewsSource(id: string): Promise<void> {
    return this.newsService.deleteSource(id);
  }

  async recomputeSegments(cityId?: string): Promise<SegmentResult[]> {
    return this.segmentsService.recompute(cityId);
  }

  async getUsers(): Promise<AdminUserResult[]> {
    const users = await this.prisma.user.findMany({
      include: { city: { select: { name: true } }, pointsGlobal: { select: { balance: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      cityId: user.cityId,
      cityName: user.city?.name ?? null,
      pointsGlobalBalance: user.pointsGlobal?.balance ?? 0,
      createdAt: user.createdAt,
    }));
  }

  async getCities(): Promise<CityResult[]> {
    const cities = await this.prisma.city.findMany({ orderBy: { name: 'asc' } });
    return cities.map((city) => ({
      id: city.id,
      name: city.name,
      slug: city.slug,
      active: city.active,
      pointsRatioGlobal: Number(city.pointsRatioGlobal),
    }));
  }

  async updateCity(id: string, dto: UpdateCityDto): Promise<CityResult> {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) {
      throw new NotFoundException('Ciudad no encontrada');
    }
    const updated = await this.prisma.city.update({
      where: { id },
      data: { pointsRatioGlobal: dto.pointsRatioGlobal },
    });
    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      active: updated.active,
      pointsRatioGlobal: Number(updated.pointsRatioGlobal),
    };
  }

  // Fila única "singleton" — se crea al primer PUT, GET cae al default de
  // @localnow/shared#QR_EXPIRY_MINUTES si todavía no existe (igual que QrService).
  async getConfig(): Promise<PlatformConfigResult> {
    const config = await this.prisma.platformConfig.findUnique({ where: { id: 'singleton' } });
    return { qrExpiryMinutes: config?.qrExpiryMinutes ?? 15 };
  }

  async updateConfig(dto: UpdateConfigDto): Promise<PlatformConfigResult> {
    const config = await this.prisma.platformConfig.upsert({
      where: { id: 'singleton' },
      update: { qrExpiryMinutes: dto.qrExpiryMinutes },
      create: { id: 'singleton', qrExpiryMinutes: dto.qrExpiryMinutes },
    });
    return { qrExpiryMinutes: config.qrExpiryMinutes };
  }

  async getGlobalAnalytics(): Promise<GlobalAnalyticsResult> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      citiesTotal,
      citiesActive,
      commercesTotal,
      commercesActive,
      commercesPending,
      usersTotal,
      transactionsAgg,
      transactionsTodayAgg,
      pointsGlobalAgg,
      couponsTotal,
      couponsActive,
      couponRedemptionsTotal,
      campaignsTotal,
      campaignsActive,
      campaignImpressionsTotal,
    ] = await Promise.all([
      this.prisma.city.count(),
      this.prisma.city.count({ where: { active: true } }),
      this.prisma.commerce.count(),
      this.prisma.commerce.count({ where: { active: true } }),
      this.prisma.commerce.count({ where: { active: false } }),
      this.prisma.user.count(),
      this.prisma.transaction.aggregate({
        where: { status: 'CONFIRMED' },
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { status: { in: ['CONFIRMED', 'ANONYMOUS'] }, timestamp: { gte: startOfDay } },
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.userPointsGlobal.aggregate({ _sum: { totalEarned: true, totalRedeemed: true } }),
      this.prisma.coupon.count(),
      this.prisma.coupon.count({ where: { status: 'ACTIVE' } }),
      this.prisma.couponRedemption.count({ where: { status: 'USED' } }),
      this.prisma.campaign.count(),
      this.prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      this.prisma.campaignImpression.count(),
    ]);

    return {
      cities: { total: citiesTotal, active: citiesActive },
      commerces: { total: commercesTotal, active: commercesActive, pending: commercesPending },
      users: { total: usersTotal },
      transactions: {
        totalConfirmed: transactionsAgg._count._all,
        totalRevenue: Number(transactionsAgg._sum.totalAmount ?? 0),
        today: {
          count: transactionsTodayAgg._count._all,
          totalAmount: Number(transactionsTodayAgg._sum.totalAmount ?? 0),
        },
      },
      points: {
        totalGlobalIssued: pointsGlobalAgg._sum.totalEarned ?? 0,
        totalGlobalRedeemed: pointsGlobalAgg._sum.totalRedeemed ?? 0,
      },
      coupons: { total: couponsTotal, active: couponsActive, totalRedemptions: couponRedemptionsTotal },
      campaigns: { total: campaignsTotal, active: campaignsActive, totalImpressions: campaignImpressionsTotal },
    };
  }
}
