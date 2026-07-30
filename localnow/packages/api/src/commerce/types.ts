import type { CommerceCategory, CommerceSchedule, SubscriptionPlan, SubscriptionStatus } from '@localnow/shared';

// Perfil público del directorio (§5, §12: GET /commerce, GET /commerce/:id) — nunca
// incluye authId, cif, datos de suscripción/Stripe ni los flags active/verified
// (el listado público ya filtra por active=true, no hace falta exponerlo).
export interface PublicCommerceResult {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  category: CommerceCategory;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string;
  logoUrl: string | null;
  description: string | null;
  schedule: CommerceSchedule | null;
  createdAt: Date;
}

// Vista del propio comercio sobre su perfil (crear/editar): añade lo que solo le
// interesa al dueño — su CIF y el estado de verificación/visibilidad (§9.1).
// cif es nullable desde §9.4: un comercio dado de alta por un admin a partir de un
// lead nace sin CIF verificado todavía.
export interface OwnCommerceResult extends PublicCommerceResult {
  cif: string | null;
  verified: boolean;
  active: boolean;
}

// Vista de administración (GET /admin/commerce, GET /admin/commerce/pending): lo
// mismo que ve el propio dueño más el estado de suscripción, que solo interesa a
// moderación/facturación, no al dueño gestionando su perfil.
export interface AdminCommerceResult extends OwnCommerceResult {
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan | null;
}

// Entrada de CommerceService.createFromLead (§9.4) — deliberadamente su propio tipo
// en vez de importar ConvertLeadDto del módulo leads: evita que commerce dependa de
// leads (es leads quien depende de commerce, no al revés). ConvertLeadDto cumple
// esta forma por estructura, no hace falta que la implemente explícitamente.
export interface CreateCommerceFromLeadInput {
  name: string;
  description?: string;
  phone?: string;
  address: string;
  email: string;
  imageUrl?: string;
  category: CommerceCategory;
  cityId: string;
}
