import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from 'src/databases/typeorm/entities';
import { PaginateQuery, Paginated, paginate, FilterOperator } from 'nestjs-paginate';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) { }

  async findAll(query: PaginateQuery): Promise<Paginated<Match>> {
    const { category, date, ...restFilters } = query.filter || {};
    let additionalFilters: Record<string, any> = {};

    if (category) {
      switch (category) {
        case 'Live':
          additionalFilters = {
            status: MatchStatus.LIVE,
          };
          break;

        case 'Date':
          if (date) {
            const dateString = Array.isArray(date) ? date[0] : date;
            const startOfDay = new Date(dateString);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(dateString);
            endOfDay.setHours(23, 59, 59, 999);

            additionalFilters = {
              matchDate: `$btw:${startOfDay.toISOString()},${endOfDay.toISOString()}`,
            };
          }
          break;

        case 'League':
          // Liga bo‘yicha filter klientdan keladigan `clubLeague.id` yoki `opponentLeague.id` orqali ishlaydi
          break;
      }
    }

    // Merge filters
    const mergedQuery: PaginateQuery = {
      ...query,
      filter: {
        ...restFilters,
        ...additionalFilters,
      },
    };

    return paginate(mergedQuery, this.matchRepository, {
      relations: [
        'club',
        'opponentClub',
        'clubLeague',
        'clubSubLeague',
        'clubMiniLeague',
        'opponentLeague',
        'opponentSubLeague',
        'opponentMiniLeague',
        'stadium',
      ],
      select: [
        'id',
        'matchDate',
        'status',
        'clubScore',
        'opponentClubScore',
        'youtube_link',

        'club.id',
        'club.name',
        'club.logo',

        'clubLeague.id',
        'clubLeague.title',

        'clubSubLeague.id',
        'clubSubLeague.title',

        'clubMiniLeague.id',
        'clubMiniLeague.title',

        'opponentClub.id',
        'opponentClub.name',
        'opponentClub.logo',

        'opponentLeague.id',
        'opponentLeague.title',

        'opponentSubLeague.id',
        'opponentSubLeague.title',

        'opponentMiniLeague.id',
        'opponentMiniLeague.title',
      ],
      sortableColumns: ['id', 'matchDate', 'status'],
      nullSort: 'last',
      defaultSortBy: [['matchDate', 'DESC']],
      searchableColumns: ['club.name', 'opponentClub.name', 'clubLeague.title'],
      filterableColumns: {
        status: [FilterOperator.EQ],
        matchDate: [FilterOperator.BTW, FilterOperator.GTE, FilterOperator.LTE],
        'club.id': [FilterOperator.EQ],
        'opponentClub.id': [FilterOperator.EQ],
        'clubLeague.id': [FilterOperator.EQ],
        'clubSubLeague.id': [FilterOperator.EQ],
        'clubMiniLeague.id': [FilterOperator.EQ],
        'opponentLeague.id': [FilterOperator.EQ],
        'opponentSubLeague.id': [FilterOperator.EQ],
        'opponentMiniLeague.id': [FilterOperator.EQ],
      },
      defaultLimit: 10,
      maxLimit: 50,
    });
  }
}
