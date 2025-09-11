import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LeagueService } from './league.service';
import { Public } from 'src/common/decorators';

@ApiTags('🏆 Client Leagues')
@Controller('client/league')
@Public()
export class LeagueController {
  constructor(private readonly leagueService: LeagueService) { }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get leagues or sub-leagues list',
    description: 'Retrieves a list of leagues. If parentLeagueId query parameter is provided, returns sub-leagues for that parent league. If no parentLeagueId is provided, returns top-level leagues (parent leagues only).'
  })
  @ApiQuery({
    name: 'parentLeagueId',
    required: false,
    description: 'Parent league ID to get sub-leagues. If not provided, returns top-level leagues.',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'List of leagues or sub-leagues with basic information',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1, description: 'League unique identifier' },
          title: { type: 'string', example: 'Premier League', description: 'League title (localized)' },
          logo: { type: 'string', example: 'https://example.com/logo.png', description: 'League logo URL' },
          parentLeagueId: { type: 'number', example: 1, description: 'Parent league ID (only for sub-leagues)', nullable: true }
        },
        required: ['id', 'title', 'logo']
      },
      example: [
        {
          id: 1,
          title: 'Premier League',
          logo: 'https://example.com/premier-league-logo.png'
        },
        {
          id: 2,
          title: 'La Liga',
          logo: 'https://example.com/la-liga-logo.png'
        }
      ]
    }
  })
  @ApiResponse({
    status: 200,
    description: 'List of sub-leagues when parentLeagueId is provided',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 3 },
          title: { type: 'string', example: 'Premier League Division 1' },
          logo: { type: 'string', example: 'https://example.com/division1-logo.png' },
          parentLeagueId: { type: 'number', example: 1 }
        }
      },
      example: [
        {
          id: 3,
          title: 'Premier League Division 1',
          logo: 'https://example.com/division1-logo.png',
          parentLeagueId: 1
        },
        {
          id: 4,
          title: 'Premier League Division 2',
          logo: 'https://example.com/division2-logo.png',
          parentLeagueId: 1
        }
      ]
    }
  })
  list(@Query('parentLeagueId') parentLeagueId?: string): Promise<{ id: number, title: string, logo: string, parentLeagueId?: number }[]> {
    const parentId = parentLeagueId ? parseInt(parentLeagueId, 10) : undefined;
    return this.leagueService.list(parentId);
  }
}
