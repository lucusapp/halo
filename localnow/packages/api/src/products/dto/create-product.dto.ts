import { ProductSource, ProductUnit } from '@localnow/shared';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUrl, MaxLength } from 'class-validator';

// name y price son siempre obligatorios, venga el alta por EAN o manual — Open Food
// Facts no tiene precios (son propios del comercio, no del catálogo global de
// productos), así que el lookup por EAN solo puede rellenar nombre/categoría/imagen,
// nunca el precio. Ese lookup se hace en el cliente (API pública con CORS abierto);
// aquí solo se recibe el resultado ya revisado por el comercio.
export class CreateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ean?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  plu?: string;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @IsEnum(ProductUnit)
  unit?: ProductUnit;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(ProductSource)
  source?: ProductSource;
}
