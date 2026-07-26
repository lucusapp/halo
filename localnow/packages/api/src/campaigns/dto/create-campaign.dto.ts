import { CampaignType, IncentiveType } from '@localnow/shared';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

// cityId NO va en el body: se toma de la ciudad del propio comercio (Commerce.cityId).
// suggestedByAi siempre queda en false aquí — no hay motor de sugerencias todavía
// (§8.4); este endpoint es para campañas manuales/cruzadas creadas por el comercio.
//
// pushMessage: política de §8.1/§17.6, no validable por código — el mensaje debe ser
// siempre genérico y nunca revelar el criterio de selección del segmento objetivo.
export class CreateCampaignDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsEnum(CampaignType)
  type!: CampaignType;

  @IsOptional()
  @IsString()
  targetSegmentId?: string;

  @IsEnum(IncentiveType)
  incentiveType!: IncentiveType;

  @IsNumber()
  @IsPositive()
  incentiveValue!: number;

  @IsString()
  @MaxLength(300)
  pushMessage!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxRedemptions?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  budgetEuros?: number;
}
