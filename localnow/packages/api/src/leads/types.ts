import type { LeadStatus } from '@localnow/shared';

// POST /leads (público) y GET /admin/leads (§9.4, nivel 1).
export interface LeadResult {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  message: string | null;
  city: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

// POST /admin/leads/scrape — mejor esfuerzo, siempre revisado por el admin antes de
// confirmar el alta (ver ConvertLeadDto): campos null cuando no se encontró nada,
// nunca se rellenan con datos inventados.
export interface ScrapedBusinessResult {
  name: string | null;
  description: string | null;
  phone: string | null;
  address: string | null;
  imageUrl: string | null;
}
