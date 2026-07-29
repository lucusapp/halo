import { Controller, Get } from '@nestjs/common';
import { CitiesService } from './cities.service';
import type { PublicCityResult } from './types';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  findAll(): Promise<PublicCityResult[]> {
    return this.citiesService.findAllActive();
  }
}
