import { Controller, Get, Param, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ClubService } from './club.service';
import { Public } from 'src/common/decorators';
import { Club, Match } from 'src/databases/typeorm/entities';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { ClubPointDto } from './dto/club-point.dto';

@ApiTags('⚽ Client Clubs')
@Controller('client/club')
@Public()
export class ClubController {
  constructor(private readonly clubService: ClubService) { }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all clubs list',
    description: 'Retrieves a simplified list of all clubs with basic information (id, name, logo) for dropdowns and selections.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of clubs with basic information',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'FC Barcelona' },
          logo: { type: 'string', example: 'https://example.com/logo.png' }
        }
      }
    }
  })
  list(): Promise<{ id: number, name: string, logo: string }[]> {
    return this.clubService.list();
  }

  @Get('point')
  @HttpCode(HttpStatus.OK)
  getCalcPonts(@Query() query: ClubPointDto) {
    return this.clubService.getCalcPonts(query);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get club by ID',
    description: 'Retrieves detailed information about a specific club including league associations and full information.'
  })
  @ApiParam({
    name: 'id',
    description: 'Club ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Club details with league information',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'FC Barcelona' },
        logo: { type: 'string', example: 'https://example.com/logo.png' },
        information: { type: 'string', example: 'Club information and description' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        league: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            title: { type: 'string', example: 'La Liga' }
          }
        },
        subLeague: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 2 },
            title: { type: 'string', example: 'Primera División' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Club not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Club with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Club> {
    return this.clubService.findOne(id);
  }

  @Get('/:id/matches/history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get club match history with pagination',
    description: 'Retrieves paginated list of past matches (finished status) for a specific club with full match details.'
  })
  @ApiParam({
    name: 'id',
    description: 'Club ID',
    type: 'number',
    example: 1
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
  @ApiQuery({
    name: 'filter.status',
    required: false,
    description: 'Filter by match status',
    enum: ['scheduled', 'live', 'half_time', 'finished', 'postponed', 'cancelled', 'abandoned', 'extra_time', 'penalty_shootout', 'awarded'],
    example: 'finished'
  })
  @ApiQuery({
    name: 'filter.matchDate',
    required: false,
    description: 'Filter by match date (supports range with $btw:start,end)',
    type: 'string',
    example: '2023-01-01'
  })
  @ApiQuery({
    name: 'filter.clubLeague.id',
    required: false,
    description: 'Filter by club league ID',
    type: 'number',
    example: 1
  })
  @ApiQuery({
    name: 'filter.opponentLeague.id',
    required: false,
    description: 'Filter by opponent league ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of club match history',
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
  @ApiResponse({
    status: 404,
    description: 'Club not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Club with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  getMatchHistory(
    @Param('id', ParseIntPipe) id: number,
    @Paginate() query: PaginateQuery
  ): Promise<Paginated<Match>> {
    return this.clubService.getMatchHistory(id, query);
  }

  @Get('/:id/matches/upcoming')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get club upcoming matches with pagination',
    description: 'Retrieves paginated list of upcoming matches (scheduled, live, or future) for a specific club with full match details.'
  })
  @ApiParam({
    name: 'id',
    description: 'Club ID',
    type: 'number',
    example: 1
  })
  @ApiQuery({
    name: 'filter.season',
    required: false,
    description: 'Season',
    type: 'string',
    example: '2025-2026'
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
    example: 'matchDate:ASC'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in club names and league titles',
    type: 'string',
    example: 'Barcelona'
  })
  @ApiQuery({
    name: 'filter.matchDate',
    required: false,
    description: 'Filter by match date (supports range with $btw:start,end)',
    type: 'string',
    example: '2023-12-31'
  })
  @ApiQuery({
    name: 'filter.clubLeague.id',
    required: false,
    description: 'Filter by club league ID',
    type: 'number',
    example: 1
  })
  @ApiQuery({
    name: 'filter.opponentLeague.id',
    required: false,
    description: 'Filter by opponent league ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of club upcoming matches',
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
  @ApiResponse({
    status: 404,
    description: 'Club not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Club with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  getUpcomingMatches(
    @Param('id', ParseIntPipe) id: number,
    @Paginate() query: PaginateQuery
  ): Promise<Paginated<Match>> {
    return this.clubService.getUpcomingMatches(id, query);
  }

}
