// GET /admin/analytics/global (§10.3, §12) — estadísticas agregadas de toda la
// plataforma, calculadas directamente aquí: a diferencia del resto de métodos de
// AdminService, esto no delega en ningún servicio existente porque no es el dominio
// de ninguno en particular — es información transversal, propia de Admin.
export interface GlobalAnalyticsResult {
  cities: { total: number; active: number };
  commerces: { total: number; active: number; pending: number };
  users: { total: number };
  transactions: {
    totalConfirmed: number;
    totalRevenue: number;
    // CONFIRMED + ANONYMOUS de hoy — mismo criterio que
    // TransactionsService.getPanelDashboard, PENDING no cuenta como venta todavía.
    today: { count: number; totalAmount: number };
  };
  points: { totalGlobalIssued: number; totalGlobalRedeemed: number };
  coupons: { total: number; active: number; totalRedemptions: number };
  campaigns: { total: number; active: number; totalImpressions: number };
}

// GET /admin/users — igual que UserPointsResult.global pero solo el saldo, sin
// desglose de earned/redeemed (esto es un listado, no el detalle de un usuario).
export interface AdminUserResult {
  id: string;
  email: string;
  name: string | null;
  cityId: string | null;
  cityName: string | null;
  pointsGlobalBalance: number;
  createdAt: Date;
}

// GET/PUT /admin/cities — de momento solo lo que pide §admin/configuracion: el
// ratio de puntos global por ciudad. No es un CRUD de altas de ciudad (eso sigue
// siendo directo en BD/seed, como hasta ahora).
export interface CityResult {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  pointsRatioGlobal: number;
}

// GET/PUT /admin/config — fila única de PlatformConfig ("singleton").
export interface PlatformConfigResult {
  qrExpiryMinutes: number;
}
