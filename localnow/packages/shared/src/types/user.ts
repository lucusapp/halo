export interface User {
  id: string;
  authId: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  cityId: string | null;
  consentDataUsage: boolean;
  consentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPointsGlobal {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  updatedAt: Date;
}
