import { IsOptional, IsString } from 'class-validator';

// cityId es opcional: si se omite, se recalculan los segmentos activos de todas las
// ciudades (comportamiento previo de SegmentsService.recompute).
export class RecomputeSegmentsDto {
  @IsOptional()
  @IsString()
  cityId?: string;
}
