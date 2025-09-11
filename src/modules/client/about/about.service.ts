import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { About } from 'src/databases/typeorm/entities/about.entity';
import { currentLocale } from 'src/common/utils/locale.util';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(About)
    private readonly aboutRepository: Repository<About>,
  ) { }

  async findAll() {
    const local = currentLocale();
    const about = await this.aboutRepository.find({
      select: {
        id: true,
        title: true,
        description: true,
      },
      take: 1,
    });

    return about?.[0] ? {
      id: about[0].id,
      title: about[0].title[local],
      description: about[0].description[local],
    } : null;
  }
}
