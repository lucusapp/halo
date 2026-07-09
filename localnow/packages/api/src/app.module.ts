import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CommerceModule } from './commerce/commerce.module';
import { CouponsModule } from './coupons/coupons.module';
import { NewsModule } from './news/news.module';
import { PointsModule } from './points/points.module';
import { QrModule } from './qr/qr.module';
import { RewardsModule } from './rewards/rewards.module';
import { SegmentsModule } from './segments/segments.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    AuthModule,
    NewsModule,
    CommerceModule,
    TransactionsModule,
    PointsModule,
    CouponsModule,
    RewardsModule,
    CampaignsModule,
    SegmentsModule,
    QrModule,
    AdminModule,
  ],
})
export class AppModule {}
