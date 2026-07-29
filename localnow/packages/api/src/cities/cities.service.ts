import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicCityResult } from './types';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<PublicCityResult[]> {
    const cities = await this.prisma.city.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
    return cities.map((city) => ({ id: city.id, name: city.name, slug: city.slug }));
  }
}
