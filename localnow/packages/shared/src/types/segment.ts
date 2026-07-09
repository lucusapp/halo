// Reglas de segmentación evaluadas por el job de recomputo nocturno (PROYECTO.md §8.3).
// Estructura libre por ahora — se tipará en detalle cuando se implemente el motor de segmentación.
export type SegmentRules = Record<string, unknown>;

export interface Segment {
  id: string;
  cityId: string;
  name: string;
  description: string | null;
  rules: SegmentRules;
  userCount: number;
  lastComputedAt: Date | null;
  active: boolean;
  createdAt: Date;
}

export interface UserSegment {
  id: string;
  userId: string;
  segmentId: string;
  assignedAt: Date;
  active: boolean;
}
