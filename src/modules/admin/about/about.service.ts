import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateAboutDto, UpdateAboutDto } from './dto';
import { About } from 'src/databases/typeorm/entities/about.entity';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(About)
    private aboutRepository: Repository<About>,
  ) {}

  async create(createAboutDto: CreateAboutDto): Promise<About> {
    const about = this.aboutRepository.create({
      title: createAboutDto.title,
      description: createAboutDto.description,
    });

    return await this.aboutRepository.save(about);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<About>> {
    const queryBuilder = this.aboutRepository
      .createQueryBuilder('about')
      .select([
        'about.id',
        'about.title',
        'about.description',
        'about.createdAt',
        'about.updatedAt',
      ]);

    return paginate(query, queryBuilder, {
      sortableColumns: ['id', 'createdAt', 'updatedAt'],
      nullSort: 'last',
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['title', 'description'],
      defaultLimit: 10,
      maxLimit: 100,
    });
  }

  async findOne(id: number): Promise<About> {
    const about = await this.aboutRepository.findOne({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!about) {
      throw new NotFoundException(`About with ID ${id} not found`);
    }

    return about;
  }

  async update(id: number, updateAboutDto: UpdateAboutDto): Promise<About> {
    const about = await this.findOne(id);

    const updateData: any = { ...updateAboutDto };

    await this.aboutRepository.update(id, updateData);

    return await this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const about = await this.findOne(id);
    await this.aboutRepository.remove(about);

    return { message: `About with ID ${id} has been successfully deleted` };
  }
}
