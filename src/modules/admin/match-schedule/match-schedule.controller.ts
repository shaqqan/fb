import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpCode, 
  HttpStatus,
  ParseIntPipe 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger';
import { Paginate, PaginateQuery, Paginated, ApiPaginationQuery } from 'nestjs-paginate';
import { MatchScheduleService } from './match-schedule.service';
import { CreateMatchScheduleDto } from './dto/create-match-schedule.dto';
import { UpdateMatchScheduleDto } from './dto/update-match-schedule.dto';
import { Match } from 'src/databases/typeorm/entities';

@ApiTags('🏟️ Match Schedule')
@ApiBearerAuth()
@Controller('admin/match-schedule')
export class MatchScheduleController {
  constructor(private readonly matchScheduleService: MatchScheduleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new match schedule' })
  @ApiBody({ type: CreateMatchScheduleDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Match schedule created successfully',
    type: Match 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation error' 
  })
  create(@Body() createMatchScheduleDto: CreateMatchScheduleDto): Promise<Match> {
    return this.matchScheduleService.create(createMatchScheduleDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all match schedules with pagination' })
  @ApiPaginationQuery({
    sortableColumns: ['id', 'matchDate', 'status', 'createdAt', 'updatedAt'],
    searchableColumns: ['club.name', 'opponentClub.name', 'stadium.name'],
    defaultSortBy: [['matchDate', 'ASC']],
    defaultLimit: 10,
    maxLimit: 100,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of match schedules',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Match' } },
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
    status: 400, 
    description: 'Bad request - invalid filter parameters' 
  })
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Match>> {
    return this.matchScheduleService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a match schedule by ID' })
  @ApiParam({ name: 'id', description: 'Match schedule ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Match schedule found successfully',
    type: Match 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Match schedule not found' 
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Match> {
    return this.matchScheduleService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a match schedule' })
  @ApiParam({ name: 'id', description: 'Match schedule ID', type: 'number' })
  @ApiBody({ type: UpdateMatchScheduleDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Match schedule updated successfully',
    type: Match 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Match schedule not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation error' 
  })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateMatchScheduleDto: UpdateMatchScheduleDto
  ): Promise<Match> {
    return this.matchScheduleService.update(id, updateMatchScheduleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a match schedule' })
  @ApiParam({ name: 'id', description: 'Match schedule ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Match schedule deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Match schedule not found' 
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.matchScheduleService.remove(id);
  }
}
