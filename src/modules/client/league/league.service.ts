import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { League } from 'src/databases/typeorm/entities';
import { currentLocale } from 'src/common/utils';

@Injectable()
export class LeagueService {
  constructor(
    @InjectRepository(League)
    private leagueRepository: Repository<League>,
  ) { }

  async list(parentLeagueId?: number): Promise<{ id: number, title: string, logo: string, parentLeagueId?: number }[]> {
    const local = currentLocale();
    
    // Build the query conditions
    const whereCondition: any = {};
    
    if (parentLeagueId !== undefined) {
      // If parentLeagueId is provided, get sub-leagues
      whereCondition.parentLeagueId = parentLeagueId;
    } else {
      // If no parentLeagueId, get top-level leagues (parent leagues)
      whereCondition.parentLeagueId = IsNull();
    }

    const leagues = await this.leagueRepository.find({
      select: {
        id: true,
        title: {
          [local]: true,
        },
        logo: true,
        parentLeagueId: true,
      },
      where: whereCondition,
      order: {
        id: 'ASC',
      },
    });

    return leagues.map(league => ({
      id: league.id,
      title: league.title[local],
      logo: league.logo,
      ...(league.parentLeagueId && { parentLeagueId: league.parentLeagueId }),
    }));
  }
}
