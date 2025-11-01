import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsStatus } from 'src/databases/typeorm/entities';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { currentLocale } from 'src/common/utils';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async findAll(query: PaginateQuery): Promise<Paginated<News>> {
    const queryBuilder = this.newsRepository
      .createQueryBuilder('news')
      .where('news.status = :status', { status: NewsStatus.PUBLISHED });

    return paginate(query, queryBuilder, {
      select: ['id', 'title', 'description', 'images', 'status', 'publishedAt'],
      sortableColumns: ['id', 'createdAt', 'updatedAt', 'publishedAt'],
      nullSort: 'last',
      defaultSortBy: [
        ['publishedAt', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      searchableColumns: ['title', 'description'],
      defaultLimit: 10,
      maxLimit: 50,
    });
  }

  async findOne(id: number): Promise<News> {
    const local = currentLocale();
    const news = await this.newsRepository.findOne({
      where: {
        id,
        status: NewsStatus.PUBLISHED,
      },
      relations: ['author'],
      select: {
        id: true,
        title: true,
        description: true,
        images: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    });

    if (!news) {
      throw new NotFoundException(
        `News with ID ${id} not found or not published`,
      );
    }

    return {
      ...news,
      title: news.title[local],
      description: news.description[local],
    } as News;
  }
}
