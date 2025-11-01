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
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  Paginate,
  PaginateQuery,
  Paginated,
  ApiPaginationQuery,
} from 'nestjs-paginate';
import { ClubService } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { Club } from 'src/databases/typeorm/entities';
import { ListClubDto } from './dto/list-club.dto';

@ApiTags('🏟️ Club')
@ApiBearerAuth()
@Controller('admin/club')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new club' })
  @ApiBody({ type: CreateClubDto })
  @ApiResponse({
    status: 201,
    description: 'Club created successfully',
    type: Club,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  create(@Body() createClubDto: CreateClubDto): Promise<Club> {
    return this.clubService.create(createClubDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all clubs with pagination' })
  @ApiPaginationQuery({
    sortableColumns: ['id', 'createdAt', 'updatedAt'],
    searchableColumns: ['name'],
    defaultSortBy: [['createdAt', 'DESC']],
    defaultLimit: 10,
    maxLimit: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of clubs',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Club' } },
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
            filter: { type: 'object' },
          },
        },
        links: {
          type: 'object',
          properties: {
            first: { type: 'string' },
            previous: { type: 'string' },
            current: { type: 'string' },
            next: { type: 'string' },
            last: { type: 'string' },
          },
        },
      },
    },
  })
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Club>> {
    return this.clubService.findAll(query);
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all clubs list' })
  @ApiQuery({
    name: 'leagueId',
    description: 'League ID',
    type: 'number',
    required: true,
  })
  @ApiQuery({
    name: 'subLeagueId',
    description: 'Sub League ID',
    type: 'number',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of clubs',
  })
  list(
    @Query() listClubDto: ListClubDto,
  ): Promise<{ id: number; name: string; logo: string }[]> {
    return this.clubService.list(listClubDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a club by ID' })
  @ApiParam({ name: 'id', description: 'Club ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Club found successfully',
    type: Club,
  })
  @ApiResponse({
    status: 404,
    description: 'Club not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Club> {
    return this.clubService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a club' })
  @ApiParam({ name: 'id', description: 'Club ID', type: 'number' })
  @ApiBody({ type: UpdateClubDto })
  @ApiResponse({
    status: 200,
    description: 'Club updated successfully',
    type: Club,
  })
  @ApiResponse({
    status: 404,
    description: 'Club not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubDto: UpdateClubDto,
  ): Promise<Club> {
    return this.clubService.update(id, updateClubDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a club' })
  @ApiParam({ name: 'id', description: 'Club ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Club deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Club not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.clubService.remove(id);
  }
}
