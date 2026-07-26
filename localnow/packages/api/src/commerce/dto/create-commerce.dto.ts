import { CommerceCategory } from '@localnow/shared';
import {
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// authId se toma del JWT ya verificado (JwtAuthGuard), nunca del body.
// El alta queda pendiente de revisión manual (§9.1): el service fuerza
// active=false y verified=false sin importar lo que llegue aquí.
export class CreateCommerceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsString()
  @IsNotEmpty()
  cityId!: string;

  @IsEnum(CommerceCategory)
  category!: CommerceCategory;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cif!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address!: string;

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

  // Email de contacto público del comercio — puede diferir del email de la cuenta
  // Clerk que lo administra.
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  // Horario semanal libre, ej: { "mon": "09:00-20:00" } (§11)
  @IsOptional()
  @IsObject()
  schedule?: Record<string, string>;
}
