import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { CommerceModule } from '../commerce/commerce.module';
import { CouponsModule } from '../coupons/coupons.module';
import { NewsModule } from '../news/news.module';
import { SegmentsModule } from '../segments/segments.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ClerkAuthModule, CommerceModule, CouponsModule, NewsModule, SegmentsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
