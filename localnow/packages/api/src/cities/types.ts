// GET /cities (público, sin auth) — solo lo que necesita el frontend público para
// mostrar la ciudad activa en el header. La vista completa (con pointsRatioGlobal,
// active) sigue siendo GET /admin/cities, protegida.
export interface PublicCityResult {
  id: string;
  name: string;
  slug: string;
}
