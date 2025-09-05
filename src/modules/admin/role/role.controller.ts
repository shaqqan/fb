import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { Permissions } from 'src/common/enums/permission.enum';
import { Paginate, PaginateQuery, Paginated, ApiPaginationQuery } from 'nestjs-paginate';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from 'src/databases/typeorm/entities';

@ApiTags('👥 Role')
@ApiBearerAuth()
@Controller('admin/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: Role })
  @ApiResponse({ status: 400, description: 'Bad request - role already exists' })
  create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all roles with pagination' })
  @ApiPaginationQuery({
    sortableColumns: ['id', 'name', 'createdAt', 'updatedAt'],
    searchableColumns: ['name'],
    defaultSortBy: [['createdAt', 'DESC']],
    defaultLimit: 10,
    maxLimit: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of roles',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Role' } },
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
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Role>> {
    return this.roleService.findAll(query);
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles found', type: [Role] })
  list(): Promise<Role[]> {
    return this.roleService.list();
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Role found', type: Role })
  @ApiResponse({ status: 400, description: 'Bad request - invalid role ID' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'number' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: Role })
  @ApiResponse({ status: 400, description: 'Bad request - invalid role ID or role name already exists' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.roleService.update(id, updateRoleDto);
  }


  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid role ID' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'number' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.roleService.remove(id);
  }

}