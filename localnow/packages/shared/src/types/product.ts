import type { ProductSource, ProductUnit } from './enums';

export interface Product {
  id: string;
  commerceId: string;
  // código de barras estándar (nullable: productos a granel no tienen EAN)
  ean: string | null;
  // código propio del comercio para productos sin EAN
  plu: string | null;
  name: string;
  category: string | null;
  price: number;
  unit: ProductUnit;
  imageUrl: string | null;
  active: boolean;
  source: ProductSource;
  createdAt: Date;
  updatedAt: Date;
}
