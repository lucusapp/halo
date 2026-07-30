import { IsUrl } from 'class-validator';

export class ScrapeBusinessDto {
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url!: string;
}
