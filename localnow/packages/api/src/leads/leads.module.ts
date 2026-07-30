import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { CommerceModule } from '../commerce/commerce.module';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [ClerkAuthModule, CommerceModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
