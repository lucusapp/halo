import { IsOptional, IsString } from 'class-validator';

// Solo hace falta si la recompensa es global (Reward.commerceId = null): indica en
// qué comercio adherido se va a canjear físicamente. Si la recompensa ya es propia
// de un comercio concreto, este campo se ignora.
export class RedeemRewardDto {
  @IsOptional()
  @IsString()
  commerceId?: string;
}
