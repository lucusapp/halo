import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { CommerceController } from './commerce.controller';
import { CommerceService } from './commerce.service';

@Module({
  imports: [ClerkAuthModule],
  controllers: [CommerceController],
  providers: [CommerceService],
  // AuthService.registerCommerce delega aquí en vez de duplicar la creación.
  exports: [CommerceService],
})
export class CommerceModule {}
