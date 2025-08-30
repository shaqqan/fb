import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { Paginate, PaginateQuery, Paginated, ApiPaginationQuery } from 'nestjs-paginate';
import { CreateLeagueDto, UpdateLeagueDto, SimplifiedLeagueDto } from './dto';
import { League } from '../../../databases/typeorm/entities';
import { LeaguesService } from './leagues.service';
import { Public } from 'src/common/decorators';
import { SubLeagueListDto } from './dto/sub-league-list.dto';

@ApiTags('🏆 Leagues')
@ApiBearerAuth()
@Controller('admin/leagues')
export class LeaguesController {
    constructor(
        private readonly leaguesService: LeaguesService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new league' })
    @ApiBody({ type: CreateLeagueDto })
    @ApiResponse({ status: 201, description: 'League created successfully', type: League })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() dto: CreateLeagueDto): Promise<League> {
        return this.leaguesService.create(dto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all leagues with pagination' })
    @ApiPaginationQuery({
        sortableColumns: ['id', 'createdAt', 'updatedAt'],
        searchableColumns: ['title'],
        defaultSortBy: [['createdAt', 'DESC']],
        defaultLimit: 10,
        maxLimit: 100,
    })
    @ApiQuery({
        name: 'filter.parentLeagueId',
        required: false,
        type: 'number',
        description: 'Filter by parent league ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Paginated list of leagues',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'array', items: { $ref: '#/components/schemas/League' } },
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
    getAll(@Paginate() query: PaginateQuery): Promise<Paginated<League>> {
        return this.leaguesService.getAll(query);
    }

    @Get('roots')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get root leagues (top-level leagues without parents)' })
    @ApiPaginationQuery({
        sortableColumns: ['id', 'createdAt', 'updatedAt'],
        searchableColumns: ['title'],
        defaultSortBy: [['createdAt', 'DESC']],
        defaultLimit: 10,
        maxLimit: 100,
    })
    @ApiResponse({
        status: 200,
        description: 'Paginated list of root leagues',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'array', items: { $ref: '#/components/schemas/League' } },
                meta: {
                    type: 'object',
                    properties: {
                        itemsPerPage: { type: 'number' },
                        totalItems: { type: 'number' },
                        currentPage: { type: 'number' },
                        totalPages: { type: 'number' },
                        sortBy: { type: 'array' },
                        searchBy: { type: 'array' },
                        search: { type: 'string' }
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
    getRootLeagues(@Paginate() query: PaginateQuery): Promise<Paginated<League>> {
        return this.leaguesService.getRootLeagues(query);
    }

    @Public()
    @Get('sub-leagues')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all sub-leagues with pagination' })
    @ApiPaginationQuery({
        sortableColumns: ['id', 'createdAt', 'updatedAt', 'title'],
        searchableColumns: ['title'],
        defaultSortBy: [['createdAt', 'DESC']],
        defaultLimit: 10,
        maxLimit: 100,
    })
    @ApiResponse({
        status: 200,
        description: 'Paginated list of sub-leagues',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'array', items: { $ref: '#/components/schemas/League' } },
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
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getSubLeagues(@Paginate() query: PaginateQuery): Promise<Paginated<League>> {
        return this.leaguesService.getSubLeagues(query);
    }

    @Get('list')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all leagues with only id and title' })
    @ApiResponse({
        status: 200,
        description: 'List of leagues with id and title',
        type: [SimplifiedLeagueDto]
    })
    getList(): Promise<SimplifiedLeagueDto[]> {
        return this.leaguesService.getSimpleLeagues();
    }

    @Get('list/sub-leagues')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all sub-leagues with only id and title' })
    @ApiResponse({
        status: 200,
        description: 'List of sub-leagues with id and title',
        type: [SimplifiedLeagueDto]
    })
    getListSubLeagues(@Query() query: SubLeagueListDto): Promise<SimplifiedLeagueDto[]> {
        return this.leaguesService.getSimpleSubLeagues(query);
    }

    @Get(':id/children')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get child leagues of a specific league' })
    @ApiParam({ name: 'id', description: 'Parent league ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'List of child leagues', type: [League] })
    @ApiResponse({ status: 404, description: 'League not found' })
    getChildren(@Param('id') id: string): Promise<League[]> {
        return this.leaguesService.getChildren(+id);
    }

    @Get(':id/parent')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get parent league of a specific league' })
    @ApiParam({ name: 'id', description: 'Child league ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Parent league found (or null if root league)',
        schema: {
            oneOf: [
                { $ref: '#/components/schemas/League' },
                { type: 'null' }
            ]
        }
    })
    @ApiResponse({ status: 404, description: 'League not found' })
    getParent(@Param('id') id: string): Promise<League | null> {
        return this.leaguesService.getParent(+id);
    }

    @Get(':id/hierarchy')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get league with full hierarchy (parent, children, and grand-children up to 3 levels)',
        description: 'Returns a league with its complete hierarchical context including parent leagues and child leagues'
    })
    @ApiParam({ name: 'id', description: 'League ID', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'League with full hierarchy',
        type: League,
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                title: { type: 'object' },
                logo: { type: 'string' },
                parentLeague: {
                    type: 'object',
                    description: 'Parent league (if exists)',
                    nullable: true
                },
                childLeagues: {
                    type: 'array',
                    description: 'Direct child leagues',
                    items: { type: 'object' }
                },
                clubs: {
                    type: 'array',
                    description: 'Clubs belonging to this league',
                    items: { type: 'object' }
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'League not found' })
    getHierarchy(@Param('id') id: string): Promise<League> {
        return this.leaguesService.getHierarchy(+id);
    }

    @Public()
    @Get("/:id")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get league by ID' })
    @ApiParam({ name: 'id', description: 'League ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'League found', type: League })
    @ApiResponse({ status: 404, description: 'League not found' })
    getById(@Param("id") id: string): Promise<League> {
        return this.leaguesService.getById(+id);
    }

    @Patch("/:id")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update league' })
    @ApiParam({ name: 'id', description: 'League ID', type: 'number' })
    @ApiBody({ type: UpdateLeagueDto })
    @ApiResponse({ status: 200, description: 'League updated successfully', type: League })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'League not found' })
    update(@Param("id") id: string, @Body() dto: UpdateLeagueDto): Promise<League> {
        return this.leaguesService.update({ id: +id, data: dto });
    }

    @Delete("/:id")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete league' })
    @ApiParam({ name: 'id', description: 'League ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'League deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'League not found' })
    delete(@Param("id") id: string): Promise<{ message: string }> {
        return this.leaguesService.remove(+id);
    }
}
