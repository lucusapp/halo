import { CouponType } from '@localnow/shared';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

// Queda en status PENDING (moderación, §5.3 paso 2) sin importar lo que llegue aquí
// — el DTO no tiene campo status.
export class CreateCouponDto {
  @IsString()
  @MaxLength(150)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(CouponType)
  type!: CouponType;

  @IsNumber()
  @IsPositive()
  value!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsInt()
  @IsPositive()
  maxRedemptions!: number;
}
