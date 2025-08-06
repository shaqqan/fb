import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { Paginate, PaginateQuery, Paginated, ApiPaginationQuery } from 'nestjs-paginate';
import { CreateNewsDto, UpdateNewsDto } from './dto';
import { News, NewsStatus, User } from '../../../databases/typeorm/entities';
import { NewsService } from './news.service';
import { GetCurrentUser, GetCurrentUserId, Public } from 'src/common/decorators';

@ApiTags('📰 News')
@Controller('admin/news')
@ApiBearerAuth()
export class NewsController {
    constructor(
        private readonly newsService: NewsService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new news article' })
    @ApiBody({ type: CreateNewsDto })
    @ApiResponse({ status: 201, description: 'News article created successfully', type: News })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@GetCurrentUserId() userId: number, @Body() dto: CreateNewsDto): Promise<News> {
        return this.newsService.create({
            data: dto,
            authorId: userId,
        });
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all news articles with pagination' })
    @ApiPaginationQuery({
        sortableColumns: ['id', 'createdAt', 'updatedAt', 'publishedAt', 'status'],
        searchableColumns: ['title', 'description'],
        defaultSortBy: [['createdAt', 'DESC']],
        defaultLimit: 10,
        maxLimit: 100,
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: NewsStatus,
        description: 'Filter by news status'
    })
    @ApiResponse({
        status: 200,
        description: 'Paginated list of news articles',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'array', items: { $ref: '#/components/schemas/News' } },
                meta: {
                    type: 'object',
                    properties: {
                        itemsPerPage: { type: 'number' },
                        totalItems: { type: 'number' },
                        currentPage: { type: 'number' },
                        totalPages: { type: 'number' },
                        sortBy: { type: 'array' },
                        searchBy: { type: 'array' },
                        search: { type: 'string' },
                        filter: { type: 'object' }
                    }
                },
                links: {
                    type: 'object',
                    properties: {
                        first: { type: 'string' },
                        previous: { type: 'string' },
                        current: { type: 'string' },
                        next: { type: 'string' },
                        last: { type: 'string' }
                    }
                }
            }
        }
    })
    getAll(
        @Paginate() query: PaginateQuery,
        @Query('status') status?: NewsStatus,
        @GetCurrentUser() user?: User
    ): Promise<Paginated<News>> {
        return this.newsService.getAll(query, status, user);
    }

    @Get("/:id")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get news article by ID' })
    @ApiParam({ name: 'id', description: 'News article ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'News article found', type: News })
    @ApiResponse({ status: 404, description: 'News article not found' })
    getById(@Param("id") id: string): Promise<News> {
        return this.newsService.getById(+id);
    }

    @Patch("/:id")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update news article' })
    @ApiParam({ name: 'id', description: 'News article ID', type: 'number' })
    @ApiBody({ type: UpdateNewsDto })
    @ApiResponse({ status: 200, description: 'News article updated successfully', type: News })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'News article not found' })
    update(@Param("id") id: string, @Body() dto: UpdateNewsDto): Promise<News> {
        return this.newsService.update({ id: +id, data: dto });
    }

    @Delete("/:id")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete news article' })
    @ApiParam({ name: 'id', description: 'News article ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'News article deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'News article not found' })
    delete(@Param("id") id: string): Promise<{ message: string }> {
        return this.newsService.remove(+id);
    }
}
