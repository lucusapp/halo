import { IsBoolean, IsDateString, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

// cityId ausente/null = promoción para todas las ciudades.
export class CreatePromotionDto {
  @IsOptional()
  @IsString()
  cityId?: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  // 2 = doble puntos durante el período, 1.5 = +50%, etc.
  @IsNumber()
  @IsPositive()
  pointsMultiplier!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
