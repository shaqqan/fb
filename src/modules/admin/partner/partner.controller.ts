import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  Paginate,
  PaginateQuery,
  Paginated,
  ApiPaginationQuery,
} from 'nestjs-paginate';
import { CreatePartnerDto, UpdatePartnerDto } from './dto';
import { Partner } from '../../../databases/typeorm/entities';
import { PartnerService } from './partner.service';

@Controller('admin/partner')
@ApiTags('🤝 Partner')
@ApiBearerAuth()
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiBody({ type: CreatePartnerDto })
  @ApiResponse({
    status: 201,
    description: 'Partner created successfully',
    type: Partner,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreatePartnerDto): Promise<Partner> {
    return this.partnerService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all partners with pagination' })
  @ApiPaginationQuery({
    sortableColumns: ['id', 'name', 'status', 'createdAt'],
    searchableColumns: ['name', 'email'],
    defaultSortBy: [['createdAt', 'DESC']],
    defaultLimit: 10,
    maxLimit: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of partners',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Partner' },
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
  getAll(@Paginate() query: PaginateQuery): Promise<Paginated<Partner>> {
    return this.partnerService.getAll(query);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get partner by ID' })
  @ApiParam({ name: 'id', description: 'Partner ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Partner found', type: Partner })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  getById(@Param('id') id: string): Promise<Partner> {
    return this.partnerService.getById(+id);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update partner' })
  @ApiParam({ name: 'id', description: 'Partner ID', type: 'number' })
  @ApiBody({ type: UpdatePartnerDto })
  @ApiResponse({
    status: 200,
    description: 'Partner updated successfully',
    type: Partner,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePartnerDto,
  ): Promise<Partner> {
    return this.partnerService.update({ id: +id, data: dto });
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete partner' })
  @ApiParam({ name: 'id', description: 'Partner ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Partner deleted successfully',
    type: Partner,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  delete(@Param('id') id: string): Promise<Partner> {
    return this.partnerService.remove(+id);
  }
}
