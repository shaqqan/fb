import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Club, Match, MatchStatus } from 'src/databases/typeorm/entities';
import { currentLocale } from 'src/common/utils';
import { PaginateQuery, Paginated, paginate, FilterOperator } from 'nestjs-paginate';
import { ClubPointDto } from './dto/club-point.dto';

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
        'file',
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
        'file',
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

  public async getCalcPonts(query: ClubPointDto) {
    const local = currentLocale();
    let startDate;
    let endDate;
    if (query.season) {
      startDate = new Date(query.season + '-01-01');
      endDate = new Date(query.season + '-12-31');
    }

    const clubs = await this.clubRepository.find({
      select: {
        id: true,
        name: true,
        logo: true,
      },
      relations: ['league', 'subLeague', 'matches'],
      where: {
        league: {
          id: query.leagueId,
        },
        subLeague: {
          id: query.subLeagueId,
        },
      },
      order: {
        id: 'ASC',
      },
    });

    const clubStats = await Promise.all(clubs.map(async club => {
      const matches = await this.matchRepository.find({
        where: [
          {
            clubId: club.id,
            status: MatchStatus.FINISHED,
            ...(startDate && endDate ? { matchDate: Between(startDate, endDate) } : {})
          },
          {
            opponentClubId: club.id,
            status: MatchStatus.FINISHED,
            ...(startDate && endDate ? { matchDate: Between(startDate, endDate) } : {})
          }
        ],
        select: ['id', 'clubId', 'opponentClubId', 'clubScore', 'opponentClubScore', 'clubLeagueId', 'clubSubLeagueId', 'opponentLeagueId', 'opponentSubLeagueId']
      });

      let matchesPlayed = 0;
      let wins = 0;
      let draws = 0;
      let losses = 0;
      let goalsScored = 0;
      let goalsConceded = 0;
      let totalPoints = 0;

      matches.forEach(match => {
        if (match.clubScore !== null && match.opponentClubScore !== null) {
          let shouldCountMatch = false;

          if (match.clubId === club.id) {
            shouldCountMatch = match.opponentLeagueId === match.clubLeagueId &&
              match.opponentSubLeagueId === match.clubSubLeagueId;
          } else {
            shouldCountMatch = match.clubLeagueId === match.opponentLeagueId &&
              match.clubSubLeagueId === match.opponentSubLeagueId;
          }

          if (shouldCountMatch) {
            matchesPlayed++;

            if (match.clubId === club.id) {
              // Club is the home team
              goalsScored += match.clubScore;
              goalsConceded += match.opponentClubScore;

              if (match.clubScore > match.opponentClubScore) {
                wins++;
                totalPoints += 3; // Victory = +3 points
              } else if (match.clubScore === match.opponentClubScore) {
                draws++;
                totalPoints += 1; // Draw = +1 point
              } else {
                losses++;
              }
            } else {
              // Club is the away team (opponent)
              goalsScored += match.opponentClubScore;
              goalsConceded += match.clubScore;

              if (match.opponentClubScore > match.clubScore) {
                wins++;
                totalPoints += 3; // Victory = +3 points
              } else if (match.opponentClubScore === match.clubScore) {
                draws++;
                totalPoints += 1; // Draw = +1 point
              } else {
                losses++;
              }
            }
          }
        }
      });

      return {
        id: club.id,
        name: club.name[local],
        logo: club.logo,
        matches_played: matchesPlayed,
        wins: wins,
        draws: draws,
        losses: losses,
        goals_scored: goalsScored,
        goals_conceded: goalsConceded,
        total_points: totalPoints,
      };
    }));

    return clubStats;
  }
}
