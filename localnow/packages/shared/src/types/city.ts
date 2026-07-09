export interface City {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  // puntos globales LocalNow por € gastado (Decimal(10,4) en BD, ver nota de dinero en index.ts)
  pointsRatioGlobal: number;
  createdAt: Date;
  updatedAt: Date;
}
