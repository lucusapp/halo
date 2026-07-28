import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import {
  Prisma,
  Product as PrismaProduct,
  ProductSource as PrismaProductSource,
  ProductUnit as PrismaProductUnit,
} from '@prisma/client';
import { ProductSource, ProductUnit } from '@localnow/shared';
import { PrismaService } from '../prisma/prisma.service';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { CreateProductDto } from './dto/create-product.dto';
import type { ProductResult } from './types';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCommercePanel(commerceAuthId: string): Promise<ProductResult[]> {
    const commerce = await this.assertCommerce(commerceAuthId);
    const products = await this.prisma.product.findMany({
      where: { commerceId: commerce.id, active: true },
      orderBy: { name: 'asc' },
    });
    return products.map((product) => this.toResult(product));
  }

  async create(commerceAuthId: string, dto: CreateProductDto): Promise<ProductResult> {
    const commerce = await this.assertCommerce(commerceAuthId);

    try {
      const product = await this.prisma.product.create({
        data: {
          commerceId: commerce.id,
          ean: dto.ean ?? null,
          plu: dto.plu ?? null,
          name: dto.name,
          category: dto.category ?? null,
          price: dto.price,
          unit: dto.unit ? mirrorEnum<PrismaProductUnit>(dto.unit) : undefined,
          imageUrl: dto.imageUrl ?? null,
          source: dto.source ? mirrorEnum<PrismaProductSource>(dto.source) : undefined,
        },
      });
      return this.toResult(product);
    } catch (error) {
      // @@unique([commerceId, ean]) / @@unique([commerceId, plu]) — ver nota en
      // schema.prisma sobre por qué esto no dispara con ean/plu = NULL.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un producto con ese código en tu catálogo');
      }
      throw error;
    }
  }

  private async assertCommerce(commerceAuthId: string) {
    const commerce = await this.prisma.commerce.findUnique({ where: { authId: commerceAuthId } });
    if (!commerce) {
      throw new ForbiddenException('Esta cuenta no está registrada como comercio');
    }
    return commerce;
  }

  private toResult(product: PrismaProduct): ProductResult {
    return {
      id: product.id,
      commerceId: product.commerceId,
      ean: product.ean,
      plu: product.plu,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      unit: mirrorEnum<ProductUnit>(product.unit),
      imageUrl: product.imageUrl,
      active: product.active,
      source: mirrorEnum<ProductSource>(product.source),
      createdAt: product.createdAt,
    };
  }
}
