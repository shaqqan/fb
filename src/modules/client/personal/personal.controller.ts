import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PersonalService } from './personal.service';
import { Public } from 'src/common/decorators';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { Personal } from 'src/databases/typeorm/entities';

@ApiTags('👥 Client Personal')
@Controller('client/personal')
@Public()
export class PersonalController {
  constructor(private readonly personalService: PersonalService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all personal records with pagination',
    description: 'Retrieves paginated list of personal records with full information including contact details and positions.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
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
    enum: ['id', 'createdAt', 'updatedAt'],
    example: 'createdAt:DESC'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in phone and email fields',
    type: 'string',
    example: 'john@example.com'
  })
  @ApiQuery({
    name: 'filter.id',
    required: false,
    description: 'Filter by personal ID',
    type: 'number',
    example: 1
  })
  @ApiQuery({
    name: 'filter.phone',
    required: false,
    description: 'Filter by phone number (exact match or partial)',
    type: 'string',
    example: '+998901234567'
  })
  @ApiQuery({
    name: 'filter.email',
    required: false,
    description: 'Filter by email address (exact match or partial)',
    type: 'string',
    example: 'john@example.com'
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of personal records',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Personal' }
        },
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
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Personal>> {
    return this.personalService.findAll(query);
  }
}
