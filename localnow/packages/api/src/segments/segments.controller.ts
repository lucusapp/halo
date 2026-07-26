import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../clerk-auth/admin.guard';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { SegmentsService } from './segments.service';
import type { SegmentResult } from './types';

// Todo bajo /admin — solo AdminUser (§10.3, §12).
// POST /admin/segments/recompute vive en AdminController (AdminService.recomputeSegments
// delega en SegmentsService.recompute) — no aquí, para no duplicar la ruta.
@Controller('admin/segments')
@UseGuards(JwtAuthGuard, AdminGuard)
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Get()
  findAll(): Promise<SegmentResult[]> {
    return this.segmentsService.findAll();
  }

  // No está en §12 explícitamente — ver el comentario en CreateSegmentDto.
  @Post()
  create(@Body() dto: CreateSegmentDto): Promise<SegmentResult> {
    return this.segmentsService.create(dto);
  }
}
