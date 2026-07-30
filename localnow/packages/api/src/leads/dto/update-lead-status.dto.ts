import { LeadStatus } from '@localnow/shared';
import { IsEnum } from 'class-validator';

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus)
  status!: LeadStatus;
}
