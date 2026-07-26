import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { PointsModule } from '../points/points.module';
import { QrModule } from '../qr/qr.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [ClerkAuthModule, PointsModule, QrModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
