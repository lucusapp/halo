// GET/POST/PUT/DELETE /admin/promotions — bonificación de puntos globales por
// período, distinta de Campaign (siempre de un comercio). Por ahora solo el
// registro: el multiplicador todavía no se aplica al calcular puntos (§ del
// enunciado de esta fase: "por ahora solo CRUD básico, sin envío push todavía").
export interface PromotionResult {
  id: string;
  cityId: string | null;
  cityName: string | null;
  name: string;
  description: string | null;
  pointsMultiplier: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
}
