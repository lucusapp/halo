import { IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

// No está en §12 (que solo documenta GET /admin/segments y POST .../recompute),
// pero sin un POST para crearlos no habría forma de dar de alta ningún segmento —
// §8.3 asume que "el backend construye" los segmentos, sin especificar cómo se dan
// de alta las reglas en sí. `rules` se valida de verdad en SegmentsService
// (parseSegmentRule) — aquí solo se exige que sea un objeto.
export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  cityId!: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsObject()
  rules!: Record<string, unknown>;
}
