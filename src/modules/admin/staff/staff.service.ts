import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import { Staff } from '../../../databases/typeorm/entities';

@Injectable()
export class StaffService {
    constructor(
        @InjectRepository(Staff)
        private staffRepository: Repository<Staff>
    ) { }

    async create(data: CreateStaffDto): Promise<Staff> {
        return await this.staffRepository.save({
            ...data,
            information: data.information as any
        });
    }

    async getAll(query: PaginateQuery): Promise<Paginated<Staff>> {
        const queryBuilder = this.staffRepository.createQueryBuilder('staff');

        return paginate(query, queryBuilder, {
            sortableColumns: ['id', 'fullname', 'position', 'status', 'createdAt'],
            nullSort: 'last',
            defaultSortBy: [['createdAt', 'DESC']],
            searchableColumns: ['fullname', 'position', 'email'],
            filterableColumns: {
                status: true,
                position: true,
            },
            defaultLimit: 10,
            maxLimit: 100,
        });
    }


    async getById(id: number): Promise<Staff> {
        const staff = await this.staffRepository.findOne({
            where: { id }
        });

        if (!staff) {
            throw new Error(`Staff with ID ${id} not found`);
        }

        return staff;
    }

    async update({ id, data }: { id: number, data: UpdateStaffDto }): Promise<Staff> {
        const updateData: any = { ...data };
        if (data.information) updateData.information = data.information;
        
        await this.staffRepository.update(id, updateData);
        
        return await this.getById(id);
    }

    async remove(id: number): Promise<Staff> {
        const staff = await this.staffRepository.findOne({
            where: { id }
        });

        if (!staff) {
            throw new Error(`Staff with ID ${id} not found`);
        }

        await this.staffRepository.delete(id);
        return staff;
    }
}
