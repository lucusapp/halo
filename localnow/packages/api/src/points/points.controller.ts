import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../clerk-auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { ClerkJwtClaims } from '../clerk-auth/types';
import { PointsService } from './points.service';
import type { UserPointsResult } from './types';

@Controller()
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('user/points')
  getUserPoints(@CurrentUser() claims: ClerkJwtClaims): Promise<UserPointsResult> {
    return this.pointsService.getUserPoints(claims.sub);
  }
}
