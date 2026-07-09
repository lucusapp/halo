import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global: casi todos los módulos de negocio necesitan Prisma; evita reimportarlo en cada uno.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
