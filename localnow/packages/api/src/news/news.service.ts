import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsArticle as PrismaNewsArticle, NewsCategory as PrismaNewsCategory, Prisma } from '@prisma/client';
import Parser from 'rss-parser';
import { NewsCategory } from '@localnow/shared';
import { PrismaService } from '../prisma/prisma.service';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { FindNewsQueryDto } from './dto/find-news-query.dto';
import type { NewsArticleResult, PaginatedNewsResult } from './types';

const PAGE_SIZE = 20;
// §4.4: "Resumen corto (máx. 2 líneas)" — no hay forma exacta de contar líneas de
// texto plano de un feed, así que se aproxima con un límite de caracteres.
const SUMMARY_MAX_LENGTH = 300;

interface CustomFeedItemFields {
  mediaContent?: { $?: { url?: string } };
}

type NewsArticleWithSource = PrismaNewsArticle & { source: { name: string } };

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  // media:content cubre bastantes feeds españoles de noticias que no usan <enclosure>
  // para la imagen de cabecera (§4.4).
  private readonly parser = new Parser<Record<string, unknown>, CustomFeedItemFields>({
    customFields: { item: [['media:content', 'mediaContent']] },
  });

  constructor(private readonly prisma: PrismaService) {}

  // §4.3: consume el RSS de cada fuente activa y guarda artículos nuevos sin
  // duplicar por URL (NewsArticle.url es única, createMany + skipDuplicates). Un
  // feed roto no debe tumbar el resto — se aísla el error por fuente.
  @Cron(CronExpression.EVERY_30_MINUTES)
  async fetchAndStore(): Promise<void> {
    const sources = await this.prisma.newsSource.findMany({
      where: { active: true, feedUrl: { not: null } },
    });

    for (const source of sources) {
      try {
        // feedUrl no puede ser null aquí: ya filtrado en la query de arriba.
        await this.fetchAndStoreSource(source.id, source.feedUrl as string, source.cityId, source.category);
      } catch (error) {
        this.logger.warn(
          `No se pudo procesar el feed de "${source.name}" (${source.feedUrl}): ${(error as Error).message}`,
        );
      }
    }
  }

  private async fetchAndStoreSource(
    sourceId: string,
    feedUrl: string,
    cityId: string,
    sourceCategory: PrismaNewsCategory | null,
  ): Promise<void> {
    if (!sourceCategory) {
      // NewsArticle.category es obligatorio; sin categoría en la fuente no hay forma
      // correcta de clasificar sus artículos — se omite hasta que se configure.
      this.logger.warn(`Fuente ${sourceId} sin categoría configurada, se omite`);
      return;
    }

    const feed = await this.parser.parseURL(feedUrl);

    const items = feed.items
      .filter((item) => item.link && item.title)
      .map((item) => ({
        sourceId,
        cityId,
        title: item.title!.trim(),
        summary: this.truncateSummary(item.contentSnippet ?? item.summary ?? item.content),
        url: item.link!,
        imageUrl: item.enclosure?.url ?? item.mediaContent?.$?.url ?? null,
        category: sourceCategory,
        publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : new Date(),
      }));

    if (items.length > 0) {
      await this.prisma.newsArticle.createMany({ data: items, skipDuplicates: true });
    }

    await this.prisma.newsSource.update({ where: { id: sourceId }, data: { lastFetchedAt: new Date() } });
  }

  async findAll(query: FindNewsQueryDto): Promise<PaginatedNewsResult> {
    const page = query.page ?? 1;
    const where: Prisma.NewsArticleWhereInput = {
      ...(query.city ? { city: { slug: query.city } } : {}),
      ...(query.category ? { category: mirrorEnum<PrismaNewsCategory>(query.category) } : {}),
    };

    const [articles, total] = await Promise.all([
      this.prisma.newsArticle.findMany({
        where,
        include: { source: { select: { name: true } } },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.newsArticle.count({ where }),
    ]);

    return {
      items: articles.map((article) => this.toResult(article)),
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  }

  async findOne(id: string): Promise<NewsArticleResult> {
    const article = await this.prisma.newsArticle.findUnique({
      where: { id },
      include: { source: { select: { name: true } } },
    });
    if (!article) {
      throw new NotFoundException('Artículo no encontrado');
    }
    return this.toResult(article);
  }

  // Listo para el futuro módulo Admin (§10.3) — sin endpoint propio todavía, mismo
  // patrón que CommerceService.approve / CouponsService.approve.
  async markFeatured(id: string): Promise<NewsArticleResult> {
    const article = await this.prisma.newsArticle.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Artículo no encontrado');
    }
    const updated = await this.prisma.newsArticle.update({
      where: { id },
      data: { featured: true },
      include: { source: { select: { name: true } } },
    });
    return this.toResult(updated);
  }

  private truncateSummary(text: string | undefined): string | null {
    if (!text) {
      return null;
    }
    const clean = text.trim();
    if (clean.length <= SUMMARY_MAX_LENGTH) {
      return clean;
    }
    return `${clean.slice(0, SUMMARY_MAX_LENGTH).trimEnd()}…`;
  }

  private toResult(article: NewsArticleWithSource): NewsArticleResult {
    return {
      id: article.id,
      sourceId: article.sourceId,
      sourceName: article.source.name,
      cityId: article.cityId,
      title: article.title,
      summary: article.summary,
      url: article.url,
      imageUrl: article.imageUrl,
      category: mirrorEnum<NewsCategory>(article.category),
      publishedAt: article.publishedAt,
      featured: article.featured,
    };
  }
}
