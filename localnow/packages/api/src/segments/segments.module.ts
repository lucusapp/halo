import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { SegmentsController } from './segments.controller';
import { SegmentsService } from './segments.service';

@Module({
  imports: [ClerkAuthModule],
  controllers: [SegmentsController],
  providers: [SegmentsService],
  // CampaignsService consulta UserSegment directamente vía Prisma para enviar
  // campañas — no necesita importar SegmentsService, así que no hace falta exportarlo
  // todavía. Se añadirá si algún módulo futuro lo necesita inyectado.
})
export class SegmentsModule {}
