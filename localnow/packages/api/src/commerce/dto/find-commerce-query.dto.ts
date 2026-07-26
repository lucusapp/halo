import { CommerceCategory } from '@localnow/shared';
import { IsEnum, IsOptional, IsString } from 'class-validator';

// GET /commerce?city=&category= (§12) — "city" es el slug de la ciudad, no su id.
export class FindCommerceQueryDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(CommerceCategory)
  category?: CommerceCategory;
}
