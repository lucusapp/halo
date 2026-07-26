import { NewsCategory } from '@localnow/shared';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

// GET /news?city=&category=&page= (§12) — "city" es el slug de la ciudad.
export class FindNewsQueryDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(NewsCategory)
  category?: NewsCategory;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}
