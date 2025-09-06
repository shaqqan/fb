import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MatchService } from './match.service';
import { Public } from 'src/common/decorators';
import { Match } from 'src/databases/typeorm/entities';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';

@ApiTags('⚽ Client Matches')
@Controller('client/match')
@Public()
export class MatchController {
  constructor(private readonly matchService: MatchService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all matches with pagination and category filtering',
    description: 'Retrieves paginated list of matches with club, opponent club, and league information. Supports category filtering for Live, League, or by a specific date.'
  })
  @ApiQuery({
    name: 'filter.category',
    required: false,
    description: 'Filter matches by category',
    enum: ['Live', 'League'],
    example: 'Live'
  })
  @ApiQuery({
    name: 'filter.date',
    required: false,
    description: 'Filter matches by a specific date (YYYY-MM-DD)',
    type: 'string',
    example: '2025-09-06'
  })
  @ApiQuery({
    name: 'filter.clubLeague.id',
    required: false,
    description: 'Filter matches by club league ID (use with category=League)',
    type: 'number',
    example: 1
  })
  @ApiQuery({
    name: 'filter.opponentLeague.id',
    required: false,
    description: 'Filter matches by opponent league ID (use with category=League)',
    type: 'number',
    example: 1
  })
  @ApiQuery({
    name: 'filter.status',
    required: false,
    description: 'Filter matches by status',
    enum: ['scheduled', 'live', 'half_time', 'finished', 'postponed', 'cancelled', 'abandoned', 'extra_time', 'penalty_shootout', 'awarded'],
    example: 'live'
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
    enum: ['id', 'matchDate', 'status'],
    example: 'matchDate:DESC'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in club names and league titles',
    type: 'string',
    example: 'Barcelona'
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of matches with category and date filtering support',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Match' }
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
            filter: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['Live', 'League'],
                  description: 'Applied category filter'
                },
                date: {
                  type: 'string',
                  format: 'date',
                  description: 'Applied date filter (YYYY-MM-DD)'
                }
              }
            }
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
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Match>> {
    return this.matchService.findAll(query);
  }

}
