// GET /user/points (§6.5): saldo global LocalNow + saldo propio en cada comercio
// donde el usuario ha comprado.
export interface UserPointsResult {
  global: {
    balance: number;
    totalEarned: number;
    totalRedeemed: number;
  };
  commerces: CommercePointsBalance[];
}

export interface CommercePointsBalance {
  commerceId: string;
  commerceName: string;
  commerceSlug: string;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
}
