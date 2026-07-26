import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { PointsModule } from '../points/points.module';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';

@Module({
  imports: [ClerkAuthModule, PointsModule],
  controllers: [QrController],
  providers: [QrService],
  // Transactions, Coupons y Rewards reusan QrService para generar tokens y validar
  // (§17.4). No importa a ninguno de ellos de vuelta: evita el mismo ciclo que
  // resolvimos con ClerkAuthModule.
  exports: [QrService],
})
export class QrModule {}
