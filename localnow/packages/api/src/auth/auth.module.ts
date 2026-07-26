import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { CommerceModule } from '../commerce/commerce.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [ClerkAuthModule, CommerceModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
