import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, Permission } from 'src/databases/typeorm/entities';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) { }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`Role '${dto.name}' already exists`);
    }

    const role = this.roleRepository.create({ name: dto.name });

    if (dto.permissionIds && dto.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({ id: In(dto.permissionIds) });

      if (permissions.length !== dto.permissionIds.length) {
        const foundIds = permissions.map(p => p.id);
        const missingIds = dto.permissionIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(`Permissions with IDs ${missingIds.join(', ')} not found`);
      }

      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Role>> {
    const queryBuilder = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .select([
        'role.id',
        'role.name',
        'role.createdAt',
        'role.updatedAt',
        'permissions.id',
        'permissions.name',
        'permissions.description',
      ]);

    return paginate(query, queryBuilder, {
      sortableColumns: ['id', 'name', 'createdAt', 'updatedAt'],
      nullSort: 'last',
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['name'],
      defaultLimit: 10,
      maxLimit: 100,
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          id: true,
          name: true,
          description: true,
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id }, relations: ['permissions'] });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (dto.name && dto.name !== role.name) {
      const nameTaken = await this.roleRepository.findOne({ where: { name: dto.name } });
      if (nameTaken) {
        throw new BadRequestException(`Role '${dto.name}' already exists`);
      }
      role.name = dto.name;
    }

    if (dto.permissionIds !== undefined) {
      if (dto.permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findBy({ id: In(dto.permissionIds) });

        if (permissions.length !== dto.permissionIds.length) {
          const foundIds = permissions.map(p => p.id);
          const missingIds = dto.permissionIds.filter(id => !foundIds.includes(id));
          throw new NotFoundException(`Permissions with IDs ${missingIds.join(', ')} not found`);
        }

        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    await this.roleRepository.save(role);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Remove role (this will automatically remove entries from role_permission_relation due to cascade)
    await this.roleRepository.remove(role);

    return { message: `Role with ID ${id} has been successfully deleted` };
  }

  async list(): Promise<Role[]> {
    const roles = await this.roleRepository.find({
      select: {
        id: true,
        name: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return roles;
  }
}