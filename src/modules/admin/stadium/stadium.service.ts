import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { UpdateStadiumDto } from './dto/update-stadium.dto';
import { Stadium } from 'src/databases/typeorm/entities';
import { currentLocale } from 'src/common/utils';

@Injectable()
export class StadiumService {
  constructor(
    @InjectRepository(Stadium)
    private stadiumRepository: Repository<Stadium>,
  ) { }

  async create(createStadiumDto: CreateStadiumDto): Promise<Stadium> {
    const stadium = new Stadium();
    stadium.name = createStadiumDto.name;
    stadium.address = createStadiumDto.address;
    stadium.city = createStadiumDto.city;

    return await this.stadiumRepository.save(stadium);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Stadium>> {
    const queryBuilder = this.stadiumRepository
      .createQueryBuilder('stadium')
      .select([
        'stadium.id',
        'stadium.name',
        'stadium.address',
        'stadium.city',
        'stadium.createdAt',
        'stadium.updatedAt'
      ]);

    return paginate(query, queryBuilder, {
      sortableColumns: ['id', 'city', 'createdAt', 'updatedAt'],
      nullSort: 'last',
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['name', 'address', 'city'],
      filterableColumns: {
        city: true,
      },
      defaultLimit: 10,
      maxLimit: 100,
    });
  }

  async list(): Promise<{ id: number, name: string }[]> {
    const local = currentLocale();
    const stadiums = await this.stadiumRepository.find({
      select: {
        id: true,
        name: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return stadiums.map(stadium => ({
      id: stadium.id,
      name: stadium.name[local],
    }));
  }

  async findOne(id: number): Promise<Stadium> {
    const stadium = await this.stadiumRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!stadium) {
      throw new NotFoundException(`Stadium with ID ${id} not found`);
    }

    return stadium;
  }

  async update(id: number, updateStadiumDto: UpdateStadiumDto): Promise<Stadium> {
    const stadium = await this.findOne(id);

    const updateData: any = { ...updateStadiumDto };

    await this.stadiumRepository.update(id, updateData);

    return await this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const stadium = await this.findOne(id);
    await this.stadiumRepository.remove(stadium);

    return { message: `Stadium with ID ${id} has been successfully deleted` };
  }
}
