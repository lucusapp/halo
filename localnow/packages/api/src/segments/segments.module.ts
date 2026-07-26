import { Module } from '@nestjs/common';
import { ClerkAuthModule } from '../clerk-auth/clerk-auth.module';
import { SegmentsController } from './segments.controller';
import { SegmentsService } from './segments.service';

@Module({
  imports: [ClerkAuthModule],
  controllers: [SegmentsController],
  providers: [SegmentsService],
  // AdminService.recomputeSegments delega en SegmentsService.recompute.
  exports: [SegmentsService],
})
export class SegmentsModule {}
