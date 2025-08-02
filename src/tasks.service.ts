import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { News, NewsStatus } from './databases/typeorm/entities';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>
  ) {}

  @Cron('*/30 * * * * *')
  async handleScheduledNewsPublishing() {
    const now = new Date();

    const newsToPublish = await this.newsRepository.find({
      where: {
        status: NewsStatus.DRAFT,
        publishedAt: LessThanOrEqual(now),
      },
    });

    if (newsToPublish.length > 0) {
      this.logger.log(`Публикуется ${newsToPublish.length} новостей...`);

      await Promise.all(
        newsToPublish.map((news) =>
          this.newsRepository.update(
            { id: news.id },
            { status: NewsStatus.PUBLISHED },
          ),
        ),
      );

      this.logger.log(`Готово: опубликовано ${newsToPublish.length} новостей.`);
    }
  }
}
