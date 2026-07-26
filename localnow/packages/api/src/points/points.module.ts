import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';

@Module({
  imports: [ClerkAuthModule],
  controllers: [PointsController],
  providers: [PointsService],
  // TransactionsService acredita puntos de compra a través de PointsService, dentro
  // de su propia transacción de BD (§17.7).
  exports: [PointsService],
})
export class PointsModule {}
