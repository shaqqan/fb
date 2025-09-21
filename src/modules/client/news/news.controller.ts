import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { News } from 'src/databases/typeorm/entities';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('📰 Client News')
@Controller('client/news')
@Public()
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all published news with pagination',
    description: 'Retrieves paginated list of published news articles with title, description, images, and publication information. Only published news articles are returned.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: 'number',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (max 50)',
    type: 'number',
    example: 10
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field (can be repeated for multiple sort fields)',
    enum: ['id', 'createdAt', 'updatedAt', 'publishedAt'],
    example: 'publishedAt:DESC'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in news titles and descriptions',
    type: 'string',
    example: 'football championship'
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of published news articles',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/News' }
        },
        meta: {
          type: 'object',
          properties: {
            itemsPerPage: { type: 'number', example: 10 },
            totalItems: { type: 'number', example: 50 },
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 5 },
            sortBy: { 
              type: 'array', 
              items: { type: 'array', items: { type: 'string' } },
              example: [['publishedAt', 'DESC'], ['createdAt', 'DESC']]
            },
            searchBy: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['title', 'description']
            },
            search: { type: 'string', example: 'football championship' },
            filter: { 
              type: 'object',
              description: 'Applied filters',
              example: {}
            }
          }
        },
        links: {
          type: 'object',
          properties: {
            first: { type: 'string', example: '/api/v1/client/news?page=1&limit=10' },
            previous: { type: 'string', example: '/api/v1/client/news?page=1&limit=10' },
            current: { type: 'string', example: '/api/v1/client/news?page=2&limit=10' },
            next: { type: 'string', example: '/api/v1/client/news?page=3&limit=10' },
            last: { type: 'string', example: '/api/v1/client/news?page=5&limit=10' }
          }
        }
      }
    }
  })
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<News>> {
    return this.newsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a published news by ID',
    description: 'Retrieves a published news article by its ID with author information.'
  })
  @ApiParam({ name: 'id', required: true, description: 'News article ID', type: 'string', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Published news article found successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { 
          type: 'object', 
          description: 'News title in multiple languages',
          example: { en: 'Breaking News', uz: 'Jarayonli Yangiliklar' }
        },
        description: { 
          type: 'object', 
          description: 'News content in multiple languages',
          example: { en: 'News content here...', uz: 'Yangilik matni...' }
        },
        images: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['/uploads/image1.jpg', '/uploads/image2.png']
        },
        status: { type: 'string', enum: ['PUBLISHED'], example: 'PUBLISHED' },
        publishedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T09:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        author: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            avatar: { type: 'string', example: '/uploads/avatar.jpg' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'News article not found or not published',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'News with ID 1 not found or not published' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<News> {
    return this.newsService.findOne(id);
  }
}
