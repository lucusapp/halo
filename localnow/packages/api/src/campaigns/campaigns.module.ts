import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [ClerkAuthModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}
