import { Controller, Get, Param, Query } from '@nestjs/common';
import { FindNewsQueryDto } from './dto/find-news-query.dto';
import { NewsService } from './news.service';
import type { NewsArticleResult, PaginatedNewsResult } from './types';

// Público, sin auth (§4.1: el feed de noticias es accesible sin registro — §10.1).
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(@Query() query: FindNewsQueryDto): Promise<PaginatedNewsResult> {
    return this.newsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<NewsArticleResult> {
    return this.newsService.findOne(id);
  }
}
