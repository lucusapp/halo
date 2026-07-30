import { CommerceCategory } from '@localnow/shared';
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

// POST /admin/leads/:id/convert — lo que el admin confirma tras revisar (y editar
// si hace falta) el resultado de POST /admin/leads/scrape. name/address/email/
// category/cityId son obligatorios porque Commerce los exige (aunque el scraping
// no los haya encontrado, el admin tiene que rellenarlos a mano); el resto son
// campos que Commerce admite en null.
export class ConvertLeadDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsString()
  @MaxLength(255)
  address!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsEnum(CommerceCategory)
  category!: CommerceCategory;

  @IsString()
  cityId!: string;
}
