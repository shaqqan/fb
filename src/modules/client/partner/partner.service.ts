import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner, PartnerStatus } from 'src/databases/typeorm/entities';
import { currentLocale } from 'src/common/utils';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
  ) {}
  async list(): Promise<{ id: number; name: string; logo: string }[]> {
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

    return partners.map((partner) => ({
      id: partner.id,
      name: (partner.name?.[local] as string) || '',
      logo: partner.image,
    }));
  }

  async show(id: number): Promise<{
    id: number;
    name: string;
    logo: string;
    description: string;
    phone: string;
    email: string;
  }> {
    const local = currentLocale();
    const partner = await this.partnerRepository.findOne({
      where: {
        id,
        status: PartnerStatus.ACTIVE,
      },
    });

    if (!partner) {
      throw new NotFoundException(
        `Partner with ID ${id} not found or not active`,
      );
    }

    return {
      id: partner.id,
      name: (partner.name?.[local] as string) || '',
      logo: partner.image,
      description: (partner.description?.[local] as string) || '',
      phone: partner.phone,
      email: partner.email,
    };
  }
}
