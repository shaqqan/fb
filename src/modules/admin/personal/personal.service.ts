import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreatePersonalDto } from './dto/create-personal.dto';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { Personal } from 'src/databases/typeorm/entities';

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Personal)
    private personalRepository: Repository<Personal>,
  ) { }

  async create(createPersonalDto: CreatePersonalDto): Promise<Personal> {
    const create = this.personalRepository.create(createPersonalDto);
    return await create.save();
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Personal>> {
    const queryBuilder = this.personalRepository
      .createQueryBuilder('personal')
      .select([
        'personal.id',
        'personal.fullName',
        'personal.position',
        'personal.information',
        'personal.phone',
        'personal.email',
        'personal.createdAt',
        'personal.updatedAt',
        'personal.avatar'
      ]);

    // Apply custom filters
    if (query.filter) {
      // Date range filters
      if (query.filter.createdAtStart) {
        const startDateValue = Array.isArray(query.filter.createdAtStart)
          ? query.filter.createdAtStart[0]
          : query.filter.createdAtStart;
        const startDate = new Date(startDateValue);
        queryBuilder.andWhere('personal.createdAt >= :createdAtStart', { createdAtStart: startDate });
      }
      if (query.filter.createdAtEnd) {
        const endDateValue = Array.isArray(query.filter.createdAtEnd)
          ? query.filter.createdAtEnd[0]
          : query.filter.createdAtEnd;
        const endDate = new Date(endDateValue);
        queryBuilder.andWhere('personal.createdAt <= :createdAtEnd', { createdAtEnd: endDate });
      }

      // Phone and email filters
      if (query.filter.phone) {
        queryBuilder.andWhere('personal.phone LIKE :phone', { phone: `%${query.filter.phone}%` });
      }
      if (query.filter.email) {
        queryBuilder.andWhere('personal.email LIKE :email', { email: `%${query.filter.email}%` });
      }
    }

    return paginate(query, queryBuilder, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      nullSort: 'last',
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['fullName', 'position', 'information', 'phone', 'email'],
      filterableColumns: {
        phone: true,
        email: true,
        createdAtStart: true,
        createdAtEnd: true,
      },
      defaultLimit: 10,
      maxLimit: 100,
    });
  }

  async findOne(id: number): Promise<Personal> {
    const personal = await this.personalRepository.findOne({
      where: { id },
      select: {
        id: true,
        fullName: true,
        position: true,
        information: true,
        phone: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!personal) {
      throw new NotFoundException(`Personal with ID ${id} not found`);
    }

    return personal;
  }

  async update(id: number, updatePersonalDto: UpdatePersonalDto): Promise<Personal> {
    const personal = await this.findOne(id);

    const updateData: any = { ...updatePersonalDto };

    await this.personalRepository.update(id, updateData);

    return await this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const personal = await this.findOne(id);
    await this.personalRepository.remove(personal);

    return { message: `Personal with ID ${id} has been successfully deleted` };
  }
}
