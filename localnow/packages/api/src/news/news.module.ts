import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  controllers: [NewsController],
  providers: [NewsService],
  // AdminService.markArticleFeatured delega en NewsService.markFeatured.
  exports: [NewsService],
})
export class NewsModule {}
