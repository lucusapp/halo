import type { AdminRole } from './enums';

export interface AdminUser {
  id: string;
  authId: string;
  email: string;
  name: string | null;
  role: AdminRole;
  createdAt: Date;
}
