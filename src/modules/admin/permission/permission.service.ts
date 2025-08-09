import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from 'src/databases/typeorm/entities';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`Permission '${dto.name}' already exists`);
    }
    const entity = this.permissionRepository.create({ name: dto.name, description: dto.description });
    return this.permissionRepository.save(entity);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Permission>> {
    const queryBuilder = this.permissionRepository.createQueryBuilder('permission');

    return paginate(query, queryBuilder, {
      sortableColumns: ['id', 'name', 'createdAt', 'updatedAt'],
      nullSort: 'last',
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['name', 'description'],
      defaultLimit: 10,
      maxLimit: 100,
    });
  }

  async findOne(id: number): Promise<Permission> {
    const entity = await this.permissionRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Permission with ID ${id} not found`);
    return entity;
  }

  async update(id: number, dto: UpdatePermissionDto): Promise<Permission> {
    const entity = await this.findOne(id);
    if (dto.name && dto.name !== entity.name) {
      const nameTaken = await this.permissionRepository.findOne({ where: { name: dto.name } });
      if (nameTaken) {
        throw new BadRequestException(`Permission '${dto.name}' already exists`);
      }
    }
    await this.permissionRepository.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const entity = await this.findOne(id);
    await this.permissionRepository.remove(entity);
    return { message: `Permission with ID ${id} has been successfully deleted` };
  }
}
