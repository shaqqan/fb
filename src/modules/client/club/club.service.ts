import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club, Match, MatchStatus } from 'src/databases/typeorm/entities';
import { currentLocale } from 'src/common/utils';
import { PaginateQuery, Paginated, paginate, FilterOperator } from 'nestjs-paginate';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) { }

  async list(): Promise<{ id: number, name: string, logo: string }[]> {
    const local = currentLocale();
    const clubs = await this.clubRepository.find({
      select: {
        id: true,
        name: {
          [local]: true,
        },
        logo: true,
      },
      order: {
        id: 'ASC',
      },
    });

    return clubs.map(club => ({
      id: club.id,
      name: club.name[local],
      logo: club.logo,
    }));
  }

  async findOne(id: number): Promise<Club> {
    const local = currentLocale();

    const club = await this.clubRepository.findOne({
      where: { id },
      relations: ['league', 'subLeague'],
      select: {
        id: true,
        name: {
          [local]: true,
        },
        logo: true,
        information: {
          [local]: true,
        },
        league: {
          id: true,
          title: {
            [local]: true,
          },
        },
        subLeague: {
          id: true,
          title: {
            [local]: true,
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    // Transform the club data to include localized fields
    return {
      ...club,
      name: club.name[local],
      information: club.information?.[local] || null,
      league: club.league ? {
        ...club.league,
        title: club.league.title[local],
      } : null,
      subLeague: club.subLeague ? {
        ...club.subLeague,
        title: club.subLeague.title[local],
      } : null,
    } as Club;
  }

  async getMatchHistory(clubId: number, query: PaginateQuery): Promise<Paginated<Match>> {
    // Verify club exists
    const club = await this.clubRepository.findOne({ where: { id: clubId } });
    if (!club) {
      throw new NotFoundException(`Club with ID ${clubId} not found`);
    }

    return paginate(query, this.matchRepository, {
      relations: ['club', 'opponentClub', 'clubLeague', 'opponentLeague', 'stadium'],
      select: [
        'id',
        'matchDate',
        'status',
        'clubScore',
        'opponentClubScore',
        'club.id',
        'club.name',
        'club.logo',
        'opponentClub.id',
        'opponentClub.name',
        'opponentClub.logo',
        'clubLeague.id',
        'clubLeague.title',
        'opponentLeague.id',
        'opponentLeague.title',
        'stadium.id',
        'stadium.name',
      ],
      sortableColumns: ['id', 'matchDate', 'status'],
      nullSort: 'last',
      defaultSortBy: [['matchDate', 'DESC']],
      searchableColumns: ['club.name', 'opponentClub.name', 'clubLeague.title', 'opponentLeague.title'],
      filterableColumns: {
        status: [FilterOperator.EQ],
        matchDate: [FilterOperator.BTW, FilterOperator.GTE, FilterOperator.LTE],
        'club.id': [FilterOperator.EQ],
        'opponentClub.id': [FilterOperator.EQ],
        'clubLeague.id': [FilterOperator.EQ],
        'opponentLeague.id': [FilterOperator.EQ],
        clubId: [FilterOperator.EQ],
        opponentClubId: [FilterOperator.EQ],
      },
      defaultLimit: 10,
      maxLimit: 50,
      where: [
        { clubId: clubId, status: MatchStatus.FINISHED },
        { opponentClubId: clubId, status: MatchStatus.FINISHED }
      ]
    });
  }

  async getUpcomingMatches(clubId: number, query: PaginateQuery): Promise<Paginated<Match>> {
    // Verify club exists
    const club = await this.clubRepository.findOne({ where: { id: clubId } });
    if (!club) {
      throw new NotFoundException(`Club with ID ${clubId} not found`);
    }

    return paginate(query, this.matchRepository, {
      relations: ['club', 'opponentClub', 'clubLeague', 'opponentLeague', 'stadium'],
      select: [
        'id',
        'matchDate',
        'status',
        'clubScore',
        'opponentClubScore',
        'club.id',
        'club.name',
        'club.logo',
        'opponentClub.id',
        'opponentClub.name',
        'opponentClub.logo',
        'clubLeague.id',
        'clubLeague.title',
        'opponentLeague.id',
        'opponentLeague.title',
        'stadium.id',
        'stadium.name',
      ],
      sortableColumns: ['id', 'matchDate', 'status'],
      nullSort: 'last',
      defaultSortBy: [['matchDate', 'ASC']],
      searchableColumns: ['club.name', 'opponentClub.name', 'clubLeague.title', 'opponentLeague.title'],
      filterableColumns: {
        status: [FilterOperator.EQ],
        matchDate: [FilterOperator.BTW, FilterOperator.GTE, FilterOperator.LTE],
        'club.id': [FilterOperator.EQ],
        'opponentClub.id': [FilterOperator.EQ],
        'clubLeague.id': [FilterOperator.EQ],
        'opponentLeague.id': [FilterOperator.EQ],
        clubId: [FilterOperator.EQ],
        opponentClubId: [FilterOperator.EQ],
      },
      defaultLimit: 10,
      maxLimit: 50,
      where: [
        { clubId: clubId, status: MatchStatus.SCHEDULED },
        { clubId: clubId, status: MatchStatus.LIVE },
        { clubId: clubId, status: MatchStatus.HALF_TIME },
        { opponentClubId: clubId, status: MatchStatus.SCHEDULED },
        { opponentClubId: clubId, status: MatchStatus.LIVE },
        { opponentClubId: clubId, status: MatchStatus.HALF_TIME }
      ]
    });
  }
}
