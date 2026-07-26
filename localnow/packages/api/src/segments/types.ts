export interface SegmentResult {
  id: string;
  cityId: string;
  name: string;
  description: string | null;
  rules: Record<string, unknown>;
  userCount: number;
  lastComputedAt: Date | null;
  active: boolean;
  createdAt: Date;
}
