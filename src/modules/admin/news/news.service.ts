import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    async getAll(status: NewsStatus | undefined, user?: User): Promise<News[]> {
        if (!user) {
            if (status && status !== NewsStatus.PUBLISHED) {
                throw new UnauthorizedException('Unauthorized to access non-published news');
            }

            return this.newsRepository.find({
                where: { status: NewsStatus.PUBLISHED },
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
        }

        const whereCondition = status ? { status } : {};
        return this.newsRepository.find({
            where: whereCondition,
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
            throw new Error(`News with ID ${id} not found`);
        }

        return news;
    }

    async getLatest(): Promise<News[]> {
        return await this.newsRepository.find({
            order: {
                createdAt: 'DESC',
            },
            take: 5,
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
        })
    }

    async update({ id, data }: { id: number, data: UpdateNewsDto }): Promise<News> {
        const updateData: any = { ...data };
        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;
        
        await this.newsRepository.update(id, updateData);
        
        return await this.getById(id);
    }

    async remove(id: number): Promise<News> {
        const news = await this.newsRepository.findOne({
            where: { id }
        });

        if (!news) {
            throw new Error(`News with ID ${id} not found`);
        }

        await this.newsRepository.delete(id);
        return news;
    }
}
