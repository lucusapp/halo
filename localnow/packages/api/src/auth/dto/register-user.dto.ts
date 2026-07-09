import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

// authId y email NO van en el body: se toman del JWT ya verificado (JwtAuthGuard),
// nunca de datos que el cliente pueda falsificar.
export class RegisterUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  // Checkbox explícito de consentimiento RGPD para uso de datos de compra (§8.1, §14)
  @IsBoolean()
  consentDataUsage!: boolean;
}
