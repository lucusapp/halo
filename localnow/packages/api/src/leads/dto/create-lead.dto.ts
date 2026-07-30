import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

// POST /leads (público, sin auth) — botón "Quiero estar en LocalNow" del
// directorio y de las tarjetas de noticia (§9.4, nivel 1).
export class CreateLeadDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsString()
  @MaxLength(150)
  businessName!: string;

  @IsString()
  @MaxLength(30)
  phone!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsString()
  @MaxLength(100)
  city!: string;
}
