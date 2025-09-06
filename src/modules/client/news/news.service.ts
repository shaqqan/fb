import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsStatus } from 'src/databases/typeorm/entities';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) { }

  async findAll(query: PaginateQuery): Promise<Paginated<News>> {
    const queryBuilder = this.newsRepository
      .createQueryBuilder('news')
      .where('news.status = :status', { status: NewsStatus.PUBLISHED });

    return paginate(query, queryBuilder, {
      select: ['id', 'title', 'description', 'images', 'status', 'publishedAt'],
      sortableColumns: ['id', 'createdAt', 'updatedAt', 'publishedAt'],
      nullSort: 'last',
      defaultSortBy: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      searchableColumns: ['title', 'description'],
      defaultLimit: 10,
      maxLimit: 50,
    });
  }
}
