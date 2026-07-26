import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { QrModule } from '../qr/qr.module';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';

@Module({
  imports: [ClerkAuthModule, QrModule],
  controllers: [RewardsController],
  providers: [RewardsService],
})
export class RewardsModule {}
