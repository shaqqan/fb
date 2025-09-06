import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personal } from 'src/databases/typeorm/entities';
import { PaginateQuery, Paginated, paginate, FilterOperator } from 'nestjs-paginate';

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Personal)
    private personalRepository: Repository<Personal>,
  ) { }

  async findAll(query: PaginateQuery): Promise<Paginated<Personal>> {
    return paginate(query, this.personalRepository, {
      select: [
        'id',
        'fullName',
        'position',
        'information',
        'phone',
        'email',
        'avatar',
      ],
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      nullSort: 'last',
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['phone', 'email'],
      filterableColumns: {
        id: [FilterOperator.EQ],
        phone: [FilterOperator.EQ, FilterOperator.ILIKE],
        email: [FilterOperator.EQ, FilterOperator.ILIKE],
      },
      defaultLimit: 10,
      maxLimit: 50,
    });
  }
}
