import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmSaleDto {
  @IsString()
  @IsNotEmpty()
  qrToken!: string;
}
