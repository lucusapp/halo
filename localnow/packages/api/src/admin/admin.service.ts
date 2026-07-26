import { Injectable } from '@nestjs/common';
import { CommerceService } from '../commerce/commerce.service';
import type { OwnCommerceResult } from '../commerce/types';
import { CouponsService } from '../coupons/coupons.service';
import type { CouponResult } from '../coupons/types';
import { NewsService } from '../news/news.service';
import type { NewsArticleResult } from '../news/types';
import { PrismaService } from '../prisma/prisma.service';
import { SegmentsService } from '../segments/segments.service';
import type { SegmentResult } from '../segments/types';
import type { GlobalAnalyticsResult } from './types';

// El módulo Admin no reimplementa nada: conecta acciones de moderación que ya
// existían como métodos "listos, sin endpoint todavía" en sus propios servicios
// (CommerceService.approve, CouponsService.approve, NewsService.markFeatured,
// SegmentsService.recompute) — mismo patrón documentado en cada uno de ellos desde
// que se escribieron.
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

  async approveCommerce(id: string): Promise<OwnCommerceResult> {
    const commerce = await this.commerceService.approve(id);
    return this.commerceService.toOwnResult(commerce);
  }

  async approveCoupon(id: string): Promise<CouponResult> {
    return this.couponsService.approve(id);
  }

  async markArticleFeatured(id: string): Promise<NewsArticleResult> {
    return this.newsService.markFeatured(id);
  }

  async recomputeSegments(cityId?: string): Promise<SegmentResult[]> {
    return this.segmentsService.recompute(cityId);
  }

  async getGlobalAnalytics(): Promise<GlobalAnalyticsResult> {
    const [
      citiesTotal,
      citiesActive,
      commercesTotal,
      commercesActive,
      commercesPending,
      usersTotal,
      transactionsAgg,
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
