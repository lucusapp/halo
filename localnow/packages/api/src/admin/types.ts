// GET /admin/analytics/global (§10.3, §12) — estadísticas agregadas de toda la
// plataforma, calculadas directamente aquí: a diferencia del resto de métodos de
// AdminService, esto no delega en ningún servicio existente porque no es el dominio
// de ninguno en particular — es información transversal, propia de Admin.
export interface GlobalAnalyticsResult {
  cities: { total: number; active: number };
  commerces: { total: number; active: number; pending: number };
  users: { total: number };
  transactions: { totalConfirmed: number; totalRevenue: number };
  points: { totalGlobalIssued: number; totalGlobalRedeemed: number };
  coupons: { total: number; active: number; totalRedemptions: number };
  campaigns: { total: number; active: number; totalImpressions: number };
}
