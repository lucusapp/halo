import { PaymentMethod } from '@localnow/shared';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';

// Un producto de catálogo (productId) o uno suelto identificado por EAN/PLU — igual
// que TransactionItem en el schema, para poder registrar la venta completa aunque el
// comercio todavía no tenga catálogo cargado (§7.4).
export class SaleItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ean?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  plu?: string;

  @IsString()
  @MaxLength(200)
  productName!: string;

  // Decimal(10,3) en BD: admite fracciones para productos a peso (ej. 1.2kg)
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

// lineTotal y totalAmount NO se aceptan del cliente — el servicio los calcula
// siempre a partir de quantity × unitPrice, nunca se confía en un total ya sumado.
export class CreateSaleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items!: SaleItemDto[];

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
