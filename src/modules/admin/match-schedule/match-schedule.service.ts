import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateMatchScheduleDto } from './dto/create-match-schedule.dto';
import { UpdateMatchScheduleDto } from './dto/update-match-schedule.dto';
import { Match, MatchStatus } from 'src/databases/typeorm/entities';

@Injectable()
export class MatchScheduleService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) { }

  async create(createMatchScheduleDto: CreateMatchScheduleDto): Promise<Match> {
    const match = await this.matchRepository.create({
      ...createMatchScheduleDto,
      matchDate: new Date(createMatchScheduleDto.matchDate),
    });

    const savedMatch = await this.matchRepository.save(match);

    return await this.findOne(savedMatch.id);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Match>> {
    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.club', 'club')
      .leftJoinAndSelect('match.clubLeague', 'clubLeague')
      .leftJoinAndSelect('match.clubSubLeague', 'clubSubLeague')
      .leftJoinAndSelect('match.opponentClub', 'opponentClub')
      .leftJoinAndSelect('match.opponentLeague', 'opponentLeague')
      .leftJoinAndSelect('match.opponentSubLeague', 'opponentSubLeague')
      .leftJoinAndSelect('match.stadium', 'stadium')
      .select([
        'match.id',
        'match.clubScore',
        'match.opponentClubScore',
        'match.matchDate',
        'match.status',
        'match.createdAt',
        'match.updatedAt',
        'club.id',
        'club.name',
        'club.logo',
        'clubLeague.id',
        'clubLeague.title',
        'clubSubLeague.id',
        'clubSubLeague.title',
        'opponentClub.id',
        'opponentClub.name',
        'opponentClub.logo',
        'opponentLeague.id',
        'opponentLeague.title',
        'opponentSubLeague.id',
        'opponentSubLeague.title',
        'stadium.id',
        'stadium.name',
        'stadium.address',
        'stadium.city'
      ]);

    // Apply custom filters
    if (query.filter) {
      // League filters
      if (query.filter.clubLeagueId) {
        queryBuilder.andWhere('clubLeague.id = :clubLeagueId', { clubLeagueId: query.filter.clubLeagueId });
      }
      if (query.filter.opponentLeagueId) {
        queryBuilder.andWhere('opponentLeague.id = :opponentLeagueId', { opponentLeagueId: query.filter.opponentLeagueId });
      }
      if (query.filter.leagueId) {
        queryBuilder.andWhere('(clubLeague.id = :leagueId OR opponentLeague.id = :leagueId)', { leagueId: query.filter.leagueId });
      }

      // Sub-league filters
      if (query.filter.clubSubLeagueId) {
        queryBuilder.andWhere('clubSubLeague.id = :clubSubLeagueId', { clubSubLeagueId: query.filter.clubSubLeagueId });
      }
      if (query.filter.opponentSubLeagueId) {
        queryBuilder.andWhere('opponentSubLeague.id = :opponentSubLeagueId', { opponentSubLeagueId: query.filter.opponentSubLeagueId });
      }
      if (query.filter.subLeagueId) {
        queryBuilder.andWhere('(clubSubLeague.id = :subLeagueId OR opponentSubLeague.id = :subLeagueId)', { subLeagueId: query.filter.subLeagueId });
      }

      // Stadium filter
      if (query.filter.stadiumId) {
        queryBuilder.andWhere('stadium.id = :stadiumId', { stadiumId: query.filter.stadiumId });
      }

      // Status filter
      if (query.filter.status) {
        queryBuilder.andWhere('match.status = :status', { status: query.filter.status });
      }

      // Date range filters
      if (query.filter.createdAtStart) {
        const startDateValue = Array.isArray(query.filter.createdAtStart) 
          ? query.filter.createdAtStart[0] 
          : query.filter.createdAtStart;
        const startDate = new Date(startDateValue);
        queryBuilder.andWhere('match.createdAt >= :createdAtStart', { createdAtStart: startDate });
      }
      if (query.filter.createdAtEnd) {
        const endDateValue = Array.isArray(query.filter.createdAtEnd) 
          ? query.filter.createdAtEnd[0] 
          : query.filter.createdAtEnd;
        const endDate = new Date(endDateValue);
        queryBuilder.andWhere('match.createdAt <= :createdAtEnd', { createdAtEnd: endDate });
      }

      // Match date range filters
      if (query.filter.matchDateStart) {
        const startDateValue = Array.isArray(query.filter.matchDateStart) 
          ? query.filter.matchDateStart[0] 
          : query.filter.matchDateStart;
        const startDate = new Date(startDateValue);
        queryBuilder.andWhere('match.matchDate >= :matchDateStart', { matchDateStart: startDate });
      }
      if (query.filter.matchDateEnd) {
        const endDateValue = Array.isArray(query.filter.matchDateEnd) 
          ? query.filter.matchDateEnd[0] 
          : query.filter.matchDateEnd;
        const endDate = new Date(endDateValue);
        queryBuilder.andWhere('match.matchDate <= :matchDateEnd', { matchDateEnd: endDate });
      }

      // Club filters
      if (query.filter.clubId) {
        queryBuilder.andWhere('club.id = :clubId', { clubId: query.filter.clubId });
      }
      if (query.filter.opponentClubId) {
        queryBuilder.andWhere('opponentClub.id = :opponentClubId', { opponentClubId: query.filter.opponentClubId });
      }
    }

    return paginate(query, queryBuilder, {
      sortableColumns: ['id', 'matchDate', 'status', 'createdAt', 'updatedAt'],
      nullSort: 'last',
      defaultSortBy: [['matchDate', 'ASC']],
      searchableColumns: ['club.name', 'opponentClub.name', 'stadium.name'],
      filterableColumns: {
        status: true,
        clubId: true,
        opponentClubId: true,
        stadiumId: true,
        clubLeagueId: true,
        opponentLeagueId: true,
        leagueId: true,
        clubSubLeagueId: true,
        opponentSubLeagueId: true,
        subLeagueId: true,
        createdAtStart: true,
        createdAtEnd: true,
        matchDateStart: true,
        matchDateEnd: true,
      },
      defaultLimit: 10,
      maxLimit: 100,
    });
  }

  async findOne(id: number): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: [
        'club',
        'clubLeague',
        'clubSubLeague',
        'opponentClub',
        'opponentLeague',
        'opponentSubLeague',
        'stadium'
      ],
      select: {
        id: true,
        clubScore: true,
        opponentClubScore: true,
        matchDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        club: {
          id: true,
          name: true,
          logo: true,
        },
        clubLeague: {
          id: true,
          title: true,
        },
        clubSubLeague: {
          id: true,
          title: true,
        },
        opponentClub: {
          id: true,
          name: true,
          logo: true,
        },
        opponentLeague: {
          id: true,
          title: true,
        },
        opponentSubLeague: {
          id: true,
          title: true,
        },
        stadium: {
          id: true,
          name: true,
          address: true,
          city: true,
        },
      },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }

  async update(id: number, updateMatchScheduleDto: UpdateMatchScheduleDto): Promise<Match> {
    const match = await this.findOne(id);

    const updateData: any = { ...updateMatchScheduleDto };

    if (updateMatchScheduleDto.clubId) {
      updateData.club = { id: updateMatchScheduleDto.clubId };
      delete updateData.clubId;
    }

    if (updateMatchScheduleDto.clubLeagueId) {
      updateData.clubLeague = { id: updateMatchScheduleDto.clubLeagueId };
      delete updateData.clubLeagueId;
    }

    if (updateMatchScheduleDto.clubSubLeagueId !== undefined) {
      updateData.clubSubLeague = updateMatchScheduleDto.clubSubLeagueId ? { id: updateMatchScheduleDto.clubSubLeagueId } : null;
      delete updateData.clubSubLeagueId;
    }

    if (updateMatchScheduleDto.opponentClubId) {
      updateData.opponentClub = { id: updateMatchScheduleDto.opponentClubId };
      delete updateData.opponentClubId;
    }

    if (updateMatchScheduleDto.opponentLeagueId) {
      updateData.opponentLeague = { id: updateMatchScheduleDto.opponentLeagueId };
      delete updateData.opponentLeagueId;
    }

    if (updateMatchScheduleDto.opponentSubLeagueId !== undefined) {
      updateData.opponentSubLeague = updateMatchScheduleDto.opponentSubLeagueId ? { id: updateMatchScheduleDto.opponentSubLeagueId } : null;
      delete updateData.opponentSubLeagueId;
    }

    if (updateMatchScheduleDto.stadiumId) {
      updateData.stadium = { id: updateMatchScheduleDto.stadiumId };
      delete updateData.stadiumId;
    }

    if (updateMatchScheduleDto.matchDate) {
      updateData.matchDate = new Date(updateMatchScheduleDto.matchDate);
      delete updateData.matchDate;
    }

    await this.matchRepository.update(id, updateData);

    return await this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const match = await this.findOne(id);
    await this.matchRepository.remove(match);

    return { message: `Match with ID ${id} has been successfully deleted` };
  }
}
