import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Paginate, PaginateQuery, Paginated, ApiPaginationQuery } from 'nestjs-paginate';
import { Staff } from '../../../databases/typeorm/entities';
import { Public } from 'src/common/decorators';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import { StaffService } from './staff.service';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
    constructor(
        private readonly staffService: StaffService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new staff member' })
    @ApiBody({ type: CreateStaffDto })
    @ApiResponse({ status: 201, description: 'Staff member created successfully', type: Staff })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() dto: CreateStaffDto): Promise<Staff> {
        return this.staffService.create(dto);
    }

    @Public()
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all staff members with pagination' })
    @ApiPaginationQuery({
        sortableColumns: ['id', 'fullname', 'position', 'status', 'createdAt'],
        searchableColumns: ['fullname', 'position', 'email'],
        defaultSortBy: [['createdAt', 'DESC']],
        defaultLimit: 10,
        maxLimit: 100,
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Paginated list of staff members',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'array', items: { $ref: '#/components/schemas/Staff' } },
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
    getAll(@Paginate() query: PaginateQuery): Promise<Paginated<Staff>> {
        return this.staffService.getAll(query);
    }

    @Public()
    @Get("/:id")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get staff member by ID' })
    @ApiParam({ name: 'id', description: 'Staff member ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'Staff member found', type: Staff })
    @ApiResponse({ status: 404, description: 'Staff member not found' })
    getById(@Param("id") id: string): Promise<Staff> {
        return this.staffService.getById(+id);
    }

    @Patch("/:id")
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update staff member' })
    @ApiParam({ name: 'id', description: 'Staff member ID', type: 'number' })
    @ApiBody({ type: UpdateStaffDto })
    @ApiResponse({ status: 200, description: 'Staff member updated successfully', type: Staff })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Staff member not found' })
    update(@Param("id") id: string, @Body() dto: UpdateStaffDto): Promise<Staff> {
        return this.staffService.update({ id: +id, data: dto });
    }

    @Delete("/:id")
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete staff member' })
    @ApiParam({ name: 'id', description: 'Staff member ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'Staff member deleted successfully', type: Staff })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Staff member not found' })
    delete(@Param("id") id: string): Promise<Staff> {
        return this.staffService.remove(+id);
    }
}
