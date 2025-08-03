import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Paginate, PaginateQuery, Paginated, ApiPaginationQuery } from 'nestjs-paginate';
import { ClubSubLeagueService } from './club-sub-league.service';
import { CreateClubSubLeagueDto, UpdateClubSubLeagueDto } from './dto';
import { ClubSubLeague } from '../../../databases/typeorm/entities';
import { Public } from 'src/common/decorators';

@ApiTags('club-sub-league')
@ApiBearerAuth()
@Controller('club-sub-league')
export class ClubSubLeagueController {
  constructor(private readonly clubSubLeagueService: ClubSubLeagueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link a club to a sub-league' })
  @ApiBody({ type: CreateClubSubLeagueDto })
  @ApiResponse({ status: 201, description: 'Club successfully linked to sub-league', type: ClubSubLeague })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Club or SubLeague not found' })
  @ApiResponse({ status: 409, description: 'Club is already linked to this sub-league' })
  create(@Body() createClubSubLeagueDto: CreateClubSubLeagueDto): Promise<ClubSubLeague> {
    return this.clubSubLeagueService.create(createClubSubLeagueDto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all club-sub-league relationships with pagination' })
  @ApiPaginationQuery({
    sortableColumns: ['clubId', 'subLeagueId'],
    defaultSortBy: [['clubId', 'ASC']],
    defaultLimit: 10,
    maxLimit: 100,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of club-sub-league relationships',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/ClubSubLeague' } },
        meta: {
          type: 'object',
          properties: {
            itemsPerPage: { type: 'number' },
            totalItems: { type: 'number' },
            currentPage: { type: 'number' },
            totalPages: { type: 'number' },
            sortBy: { type: 'array' },
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
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<ClubSubLeague>> {
    return this.clubSubLeagueService.findAll(query);
  }

  @Public()
  @Get('club/:clubId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all sub-leagues for a specific club' })
  @ApiParam({ name: 'clubId', description: 'Club ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'List of sub-leagues for the club', type: [ClubSubLeague] })
  @ApiResponse({ status: 404, description: 'Club not found' })
  findByClub(@Param('clubId') clubId: string): Promise<ClubSubLeague[]> {
    return this.clubSubLeagueService.findByClub(+clubId);
  }

  @Public()
  @Get('sub-league/:subLeagueId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all clubs for a specific sub-league' })
  @ApiParam({ name: 'subLeagueId', description: 'Sub-league ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'List of clubs for the sub-league', type: [ClubSubLeague] })
  @ApiResponse({ status: 404, description: 'Sub-league not found' })
  findBySubLeague(@Param('subLeagueId') subLeagueId: string): Promise<ClubSubLeague[]> {
    return this.clubSubLeagueService.findBySubLeague(+subLeagueId);
  }

  @Public()
  @Get(':clubId/:subLeagueId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific club-sub-league relationship' })
  @ApiParam({ name: 'clubId', description: 'Club ID', type: 'number' })
  @ApiParam({ name: 'subLeagueId', description: 'Sub-league ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Club-sub-league relationship found', type: ClubSubLeague })
  @ApiResponse({ status: 404, description: 'Relationship not found' })
  findOne(
    @Param('clubId') clubId: string, 
    @Param('subLeagueId') subLeagueId: string
  ): Promise<ClubSubLeague> {
    return this.clubSubLeagueService.findOne(+clubId, +subLeagueId);
  }

  @Patch(':clubId/:subLeagueId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update club-sub-league relationship' })
  @ApiParam({ name: 'clubId', description: 'Club ID', type: 'number' })
  @ApiParam({ name: 'subLeagueId', description: 'Sub-league ID', type: 'number' })
  @ApiBody({ type: UpdateClubSubLeagueDto })
  @ApiResponse({ status: 200, description: 'Relationship updated successfully', type: ClubSubLeague })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Relationship not found' })
  @ApiResponse({ status: 409, description: 'New relationship already exists' })
  update(
    @Param('clubId') clubId: string, 
    @Param('subLeagueId') subLeagueId: string,
    @Body() updateClubSubLeagueDto: UpdateClubSubLeagueDto
  ): Promise<ClubSubLeague> {
    return this.clubSubLeagueService.update(+clubId, +subLeagueId, updateClubSubLeagueDto);
  }

  @Delete(':clubId/:subLeagueId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink club from sub-league' })
  @ApiParam({ name: 'clubId', description: 'Club ID', type: 'number' })
  @ApiParam({ name: 'subLeagueId', description: 'Sub-league ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Club successfully unlinked from sub-league' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Relationship not found' })
  remove(
    @Param('clubId') clubId: string, 
    @Param('subLeagueId') subLeagueId: string
  ): Promise<{ message: string }> {
    return this.clubSubLeagueService.remove(+clubId, +subLeagueId);
  }
}
