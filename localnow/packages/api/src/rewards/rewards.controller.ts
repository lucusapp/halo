import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../clerk-auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { ClerkJwtClaims } from '../clerk-auth/types';
import { RedeemRewardDto } from './dto/redeem-reward.dto';
import { RewardsService } from './rewards.service';
import type { AvailableRewardResult, RewardRedemptionResult } from './types';

@Controller()
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('user/rewards/available')
  getAvailable(@CurrentUser() claims: ClerkJwtClaims): Promise<AvailableRewardResult[]> {
    return this.rewardsService.getAvailable(claims.sub);
  }

  @Post('user/rewards/:id/redeem')
  redeem(
    @Param('id') id: string,
    @CurrentUser() claims: ClerkJwtClaims,
    @Body() dto: RedeemRewardDto,
  ): Promise<RewardRedemptionResult> {
    return this.rewardsService.redeem(claims.sub, id, dto);
  }
}
