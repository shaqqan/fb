import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateNewsDto, UpdateNewsDto } from './dto';
import { News, NewsStatus, User } from '../../../databases/typeorm/entities';

@Injectable()
export class NewsService {
    constructor(
        @InjectRepository(News)
        private newsRepository: Repository<News>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create({ data, authorId }: { data: CreateNewsDto; authorId: number }): Promise<News> {
        return await this.newsRepository.save({
            ...data,
            authorId,
            title: data.title,
            description: data.description
        });
    }

    async getAll(query: PaginateQuery, status?: NewsStatus, user?: User): Promise<Paginated<News>> {
        const queryBuilder = this.newsRepository
            .createQueryBuilder('news')
            .leftJoinAndSelect('news.author', 'author')
            .select([
                'news.id',
                'news.title',
                'news.description',
                'news.images',
                'news.status',
                'news.authorId',
                'news.publishedAt',
                'news.createdAt',
                'news.updatedAt',
                'author.id',
                'author.name',
                'author.email'
            ]);

        // Apply status filtering
        if (!user) {
            if (status && status !== NewsStatus.PUBLISHED) {
                throw new UnauthorizedException('Unauthorized to access non-published news');
            }
            queryBuilder.where('news.status = :status', { status: NewsStatus.PUBLISHED });
        } else if (status) {
            queryBuilder.where('news.status = :status', { status });
        }

        return paginate(query, queryBuilder, {
            sortableColumns: ['id', 'createdAt', 'updatedAt', 'publishedAt', 'status'],
            nullSort: 'last',
            defaultSortBy: [['createdAt', 'DESC']],
            searchableColumns: ['title', 'description'],
            filterableColumns: {
                status: true,
                authorId: true,
            },
            defaultLimit: 10,
            maxLimit: 100,
        });
    }


    async getById(id: number): Promise<News> {
        const news = await this.newsRepository.findOne({
            where: { id },
            relations: ['author'],
            select: {
                id: true,
                title: true,
                description: true,
                images: true,
                status: true,
                authorId: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        });

        if (!news) {
            throw new NotFoundException(`News with ID ${id} not found`);
        }

        return news;
    }

    async update({ id, data }: { id: number, data: UpdateNewsDto }): Promise<News> {
        const updateData: any = { ...data };
        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;

        await this.newsRepository.update(id, updateData);

        return await this.getById(id);
    }

    async remove(id: number): Promise<{ message: string }> {
        const news = await this.newsRepository.findOne({
            where: { id }
        });

        if (!news) {
            throw new NotFoundException(`News with ID ${id} not found`);
        }

        await this.newsRepository.delete(id);
        return { message: 'News deleted successfully' };
    }
}
