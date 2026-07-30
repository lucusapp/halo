import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CitiesModule } from './cities/cities.module';
import { CommerceModule } from './commerce/commerce.module';
import { CouponsModule } from './coupons/coupons.module';
import { LeadsModule } from './leads/leads.module';
import { NewsModule } from './news/news.module';
import { PointsModule } from './points/points.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { PromotionsModule } from './promotions/promotions.module';
import { QrModule } from './qr/qr.module';
import { RewardsModule } from './rewards/rewards.module';
import { SegmentsModule } from './segments/segments.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    CitiesModule,
    NewsModule,
    CommerceModule,
    TransactionsModule,
    PointsModule,
    CouponsModule,
    LeadsModule,
    ProductsModule,
    PromotionsModule,
    RewardsModule,
    CampaignsModule,
    SegmentsModule,
    QrModule,
    AdminModule,
  ],
})
export class AppModule {}
