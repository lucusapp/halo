import type { ProductSource, ProductUnit } from '@localnow/shared';

// GET /panel/products, POST /panel/products (§11, §12) — catálogo propio del comercio.
export interface ProductResult {
  id: string;
  commerceId: string;
  ean: string | null;
  plu: string | null;
  name: string;
  category: string | null;
  price: number;
  unit: ProductUnit;
  imageUrl: string | null;
  active: boolean;
  source: ProductSource;
  createdAt: Date;
}
