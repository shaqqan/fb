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
import { PersonalService } from './personal.service';
import { CreatePersonalDto } from './dto/create-personal.dto';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { Personal } from 'src/databases/typeorm/entities';

@ApiTags('👤 Personal')
@ApiBearerAuth()
@Controller('admin/personal')
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new personal record' })
  @ApiBody({ type: CreatePersonalDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Personal record created successfully',
    type: Personal 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation error' 
  })
  create(@Body() createPersonalDto: CreatePersonalDto): Promise<Personal> {
    return this.personalService.create(createPersonalDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all personal records with pagination' })
  @ApiPaginationQuery({
    sortableColumns: ['id', 'createdAt', 'updatedAt'],
    searchableColumns: ['fullName', 'position', 'information', 'phone', 'email'],
    defaultSortBy: [['createdAt', 'DESC']],
    defaultLimit: 10,
    maxLimit: 100,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of personal records',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Personal' } },
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a personal record by ID' })
  @ApiParam({ name: 'id', description: 'Personal record ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Personal record found successfully',
    type: Personal 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Personal record not found' 
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Personal> {
    return this.personalService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a personal record' })
  @ApiParam({ name: 'id', description: 'Personal record ID', type: 'number' })
  @ApiBody({ type: UpdatePersonalDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Personal record updated successfully',
    type: Personal 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Personal record not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation error' 
  })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePersonalDto: UpdatePersonalDto
  ): Promise<Personal> {
    return this.personalService.update(id, updatePersonalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a personal record' })
  @ApiParam({ name: 'id', description: 'Personal record ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Personal record deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Personal record not found' 
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.personalService.remove(id);
  }
}
