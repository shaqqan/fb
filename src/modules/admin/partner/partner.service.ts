import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreatePartnerDto, UpdatePartnerDto } from './dto';
import { Partner } from '../../../databases/typeorm/entities';

@Injectable()
export class PartnerService {
    constructor(
        @InjectRepository(Partner)
        private partnerRepository: Repository<Partner>
    ) { }

    async create(data: CreatePartnerDto): Promise<Partner> {
        return await this.partnerRepository.save({
            ...data,
            description: data.description as any
        });
    }

    async getAll(query: PaginateQuery): Promise<Paginated<Partner>> {
        const queryBuilder = this.partnerRepository.createQueryBuilder('partner');

        return paginate(query, queryBuilder, {
            sortableColumns: ['id', 'name', 'status', 'createdAt'],
            nullSort: 'last',
            defaultSortBy: [['createdAt', 'DESC']],
            searchableColumns: ['name', 'email'],
            filterableColumns: {
                status: true,
            },
            defaultLimit: 10,
            maxLimit: 100,
        });
    }


    async getById(id: number): Promise<Partner> {
        const partner = await this.partnerRepository.findOne({
            where: { id }
        });

        if (!partner) {
            throw new Error(`Partner with ID ${id} not found`);
        }

        return partner;
    }

    async update({id, data}: { id: number, data: UpdatePartnerDto}): Promise<Partner> {
        const updateData: any = { ...data };
        if (data.description) updateData.description = data.description;
        
        await this.partnerRepository.update(id, updateData);
        
        return await this.getById(id);
    }

    async remove(id: number): Promise<Partner> {
        const partner = await this.partnerRepository.findOne({
            where: { id }
        });

        if (!partner) {
            throw new Error(`Partner with ID ${id} not found`);
        }

        await this.partnerRepository.delete(id);
        return partner;
    }
}
