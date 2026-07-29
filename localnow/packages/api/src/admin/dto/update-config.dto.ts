import { IsInt, Min } from 'class-validator';

export class UpdateConfigDto {
  @IsInt()
  @Min(1)
  qrExpiryMinutes!: number;
}
