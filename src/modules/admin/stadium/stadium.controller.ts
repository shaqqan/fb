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
import { StadiumService } from './stadium.service';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { UpdateStadiumDto } from './dto/update-stadium.dto';
import { Stadium } from 'src/databases/typeorm/entities';

@ApiTags('🏟️ Stadium')
@ApiBearerAuth()
@Controller('admin/stadium')
export class StadiumController {
  constructor(private readonly stadiumService: StadiumService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new stadium' })
  @ApiBody({ type: CreateStadiumDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Stadium created successfully',
    type: Stadium 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation error' 
  })
  create(@Body() createStadiumDto: CreateStadiumDto): Promise<Stadium> {
    return this.stadiumService.create(createStadiumDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all stadiums with pagination' })
  @ApiPaginationQuery({
    sortableColumns: ['id', 'city', 'createdAt', 'updatedAt'],
    searchableColumns: ['name', 'address', 'city'],
    defaultSortBy: [['createdAt', 'DESC']],
    defaultLimit: 10,
    maxLimit: 100,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of stadiums',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Stadium' } },
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
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Stadium>> {
    return this.stadiumService.findAll(query);
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all stadiums as a simple list' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all stadiums',
    type: [Stadium]
  })
  list(): Promise<Stadium[]> {
    return this.stadiumService.list();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a stadium by ID' })
  @ApiParam({ name: 'id', description: 'Stadium ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Stadium found successfully',
    type: Stadium 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Stadium not found' 
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Stadium> {
    return this.stadiumService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a stadium' })
  @ApiParam({ name: 'id', description: 'Stadium ID', type: 'number' })
  @ApiBody({ type: UpdateStadiumDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Stadium updated successfully',
    type: Stadium 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Stadium not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation error' 
  })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateStadiumDto: UpdateStadiumDto
  ): Promise<Stadium> {
    return this.stadiumService.update(id, updateStadiumDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a stadium' })
  @ApiParam({ name: 'id', description: 'Stadium ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Stadium deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Stadium not found' 
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.stadiumService.remove(id);
  }

  
}
