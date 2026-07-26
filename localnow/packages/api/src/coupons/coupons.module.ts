import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { QrModule } from '../qr/qr.module';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

@Module({
  imports: [ClerkAuthModule, QrModule],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
