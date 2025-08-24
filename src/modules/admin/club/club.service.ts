import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { Club } from 'src/databases/typeorm/entities';
import { currentLocale } from 'src/common/utils';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
  ) { }

  async create(createClubDto: CreateClubDto): Promise<Club> {
    const club = await this.clubRepository.create({
      name: createClubDto.name,
      logo: createClubDto.logo,
      information: createClubDto.information,
      league: { id: createClubDto.leagueId },
      subLeague: { id: createClubDto.subLeagueId },
    });

    return await this.clubRepository.save(club);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Club>> {
    const queryBuilder = this.clubRepository
      .createQueryBuilder('club')
      .leftJoinAndSelect('club.league', 'league')
      .leftJoinAndSelect('club.subLeague', 'subLeague')
      .select([
        'club.id',
        'club.name',
        'club.logo',
        'club.information',
        'club.createdAt',
        'club.updatedAt',
        'league.id',
        'league.title',
        'subLeague.id',
        'subLeague.title'
      ]);

    const local = currentLocale();

    if (query.search) {
      queryBuilder.andWhere(
        `(club.name->>:locale LIKE :search OR club.information->>:locale LIKE :search)`,
        {
          search: `%${query.search}%`,
          locale: local,
          fallbackLocale: 'uz'
        }
      );
    }

    return paginate(query, queryBuilder, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      nullSort: 'last',
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        leagueId: true,
        subLeagueId: true,
      },
      defaultLimit: 10,
      maxLimit: 100,
    });
  }

  async findOne(id: number): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { id },
      relations: ['league', 'subLeague'],
      select: {
        id: true,
        name: true,
        logo: true,
        information: true,
        createdAt: true,
        updatedAt: true,
        league: {
          id: true,
          title: true,
        },
        subLeague: {
          id: true,
          title: true,
        },
      },
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    return club;
  }

  async update(id: number, updateClubDto: UpdateClubDto): Promise<Club> {
    const club = await this.findOne(id);

    const updateData: any = { ...updateClubDto };

    if (updateClubDto.leagueId) {
      updateData.league = { id: updateClubDto.leagueId };
      delete updateData.leagueId;
    }

    if (updateClubDto.subLeagueId !== undefined) {
      updateData.subLeague = updateClubDto.subLeagueId ? { id: updateClubDto.subLeagueId } : null;
      delete updateData.subLeagueId;
    }

    await this.clubRepository.update(id, updateData);

    return await this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const club = await this.findOne(id);
    await this.clubRepository.remove(club);

    return { message: `Club with ID ${id} has been successfully deleted` };
  }
}
