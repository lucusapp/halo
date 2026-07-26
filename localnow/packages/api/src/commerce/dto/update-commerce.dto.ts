import { CommerceCategory } from '@localnow/shared';
import {
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Edición del perfil público (§9.2). Deliberadamente sin cityId ni cif: cambiar de
// ciudad o de CIF no es una edición de perfil casual, afecta a la verificación del
// alta (§9.1) — necesitaría su propio flujo si hace falta más adelante.
export class UpdateCommerceDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsEnum(CommerceCategory)
  category?: CommerceCategory;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsObject()
  schedule?: Record<string, string>;
}
