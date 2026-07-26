import { CouponStatus, CouponType } from '@localnow/shared';
import { IsDateString, IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

// El comercio puede pausar (DRAFT) o archivar (EXPIRED) su propio cupón, pero no
// activarlo directamente: pasar a ACTIVE requiere moderación
// (CouponsService.approve, sin endpoint propio todavía — llegará con el módulo Admin).
export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(CouponType)
  type?: CouponType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  value?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxRedemptions?: number;

  @IsOptional()
  @IsIn([CouponStatus.DRAFT, CouponStatus.EXPIRED])
  status?: CouponStatus;
}
