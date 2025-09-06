import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner, PartnerStatus } from 'src/databases/typeorm/entities';
import { currentLocale } from 'src/common/utils';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
  ) { }
  async list(): Promise<{ id: number, name: string, logo: string }[]> {
    const local = currentLocale();
    const partners = await this.partnerRepository.find({
      select: {
        id: true,
        name: {
          [local]: true,
        },
        image: true,
      },
      where: {
        status: PartnerStatus.ACTIVE,
      },
    });

    return partners.map(partner => ({
      id: partner.id,
      name: partner.name[local],
      logo: partner.image,
    }));
  }
}
