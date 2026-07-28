import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [ClerkAuthModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
