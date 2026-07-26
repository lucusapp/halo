import { BadRequestException } from '@nestjs/common';

// §8.3 da 7 ejemplos de segmentos, pero varios requieren cosas que no tenemos
// (clasificación de producto por categoría semántica tipo "productos asiáticos").
// Se implementan 3 reglas concretas, verificables con datos reales de Transaction:
// gasto medio por visita, frecuencia de compra, e inactividad reciente. Todas
// opcionalmente ámbito a un comercio (commerceId) o a toda la plataforma si se omite.
export type SegmentRule =
  | { type: 'MIN_AVG_SPEND'; commerceId?: string; minAmount: number }
  | { type: 'MIN_PURCHASE_FREQUENCY'; commerceId?: string; minPurchases: number; withinDays: number }
  | { type: 'INACTIVE_SINCE'; commerceId?: string; daysSinceLastPurchase: number };

// Segment.rules es Json a nivel de schema (sin validar en BD) — esta es la única
// puerta de entrada real: se valida la forma antes de guardar o de recomputar.
export function parseSegmentRule(raw: unknown): SegmentRule {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !('type' in raw)) {
    throw new BadRequestException('rules debe ser un objeto con un campo "type" válido');
  }
  const rule = raw as Record<string, unknown>;
  const commerceId = typeof rule.commerceId === 'string' ? rule.commerceId : undefined;

  switch (rule.type) {
    case 'MIN_AVG_SPEND': {
      if (typeof rule.minAmount !== 'number' || rule.minAmount <= 0) {
        throw new BadRequestException('La regla MIN_AVG_SPEND requiere minAmount > 0');
      }
      return { type: 'MIN_AVG_SPEND', commerceId, minAmount: rule.minAmount };
    }
    case 'MIN_PURCHASE_FREQUENCY': {
      if (typeof rule.minPurchases !== 'number' || rule.minPurchases <= 0) {
        throw new BadRequestException('La regla MIN_PURCHASE_FREQUENCY requiere minPurchases > 0');
      }
      if (typeof rule.withinDays !== 'number' || rule.withinDays <= 0) {
        throw new BadRequestException('La regla MIN_PURCHASE_FREQUENCY requiere withinDays > 0');
      }
      return { type: 'MIN_PURCHASE_FREQUENCY', commerceId, minPurchases: rule.minPurchases, withinDays: rule.withinDays };
    }
    case 'INACTIVE_SINCE': {
      if (typeof rule.daysSinceLastPurchase !== 'number' || rule.daysSinceLastPurchase <= 0) {
        throw new BadRequestException('La regla INACTIVE_SINCE requiere daysSinceLastPurchase > 0');
      }
      return { type: 'INACTIVE_SINCE', commerceId, daysSinceLastPurchase: rule.daysSinceLastPurchase };
    }
    default:
      throw new BadRequestException(
        `Tipo de regla desconocido: "${String(rule.type)}". Valores válidos: MIN_AVG_SPEND, MIN_PURCHASE_FREQUENCY, INACTIVE_SINCE`,
      );
  }
}
