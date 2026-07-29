import { IsNumber, IsPositive } from 'class-validator';

export class UpdateCityDto {
  @IsNumber()
  @IsPositive()
  pointsRatioGlobal!: number;
}
