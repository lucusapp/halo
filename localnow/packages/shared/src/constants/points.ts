// Caducidad de los QR de un solo uso (cupones y recompensas) — PROYECTO.md §6.5, §6.6
export const QR_EXPIRY_MINUTES = 15;

// Si el cliente no escanea el QR de venta en este tiempo, la transacción pasa
// a ANONYMOUS: se guardan los datos de venta sin vincular a usuario — PROYECTO.md §13.1
export const TRANSACTION_ANONYMOUS_TIMEOUT_MINUTES = 5;

// Ratio por defecto de puntos globales LocalNow por € gastado, configurable por
// ciudad (City.pointsRatioGlobal en BD) — PROYECTO.md §6.2
export const DEFAULT_POINTS_RATIO_GLOBAL = 2;
