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
import { AboutService } from './about.service';
import { CreateAboutDto, UpdateAboutDto } from './dto';
import { About } from 'src/databases/typeorm/entities/about.entity';

@ApiTags('ℹ️ About')
@ApiBearerAuth()
@Controller('admin/about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new about record' })
  @ApiBody({ type: CreateAboutDto })
  @ApiResponse({
    status: 201,
    description: 'About record created successfully',
    type: About
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error'
  })
  create(@Body() createAboutDto: CreateAboutDto): Promise<About> {
    return this.aboutService.create(createAboutDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all about records with pagination' })
  @ApiPaginationQuery({
    sortableColumns: ['id', 'createdAt', 'updatedAt'],
    searchableColumns: ['title', 'description'],
    defaultSortBy: [['createdAt', 'DESC']],
    defaultLimit: 10,
    maxLimit: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of about records',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/About' } },
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
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<About>> {
    return this.aboutService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an about record by ID' })
  @ApiParam({ name: 'id', description: 'About record ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'About record found successfully',
    type: About
  })
  @ApiResponse({
    status: 404,
    description: 'About record not found'
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<About> {
    return this.aboutService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an about record' })
  @ApiParam({ name: 'id', description: 'About record ID', type: 'number' })
  @ApiBody({ type: UpdateAboutDto })
  @ApiResponse({
    status: 200,
    description: 'About record updated successfully',
    type: About
  })
  @ApiResponse({
    status: 404,
    description: 'About record not found'
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error'
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAboutDto: UpdateAboutDto
  ): Promise<About> {
    return this.aboutService.update(id, updateAboutDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an about record' })
  @ApiParam({ name: 'id', description: 'About record ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'About record deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'About record not found'
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.aboutService.remove(id);
  }
}
