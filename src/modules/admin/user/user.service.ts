import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import * as argon from 'argon2';
import { User, Role } from '../../../databases/typeorm/entities';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, roleIds, ...userData } = createUserDto;

    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await argon.hash(password);

    // Get roles if provided
    let roles: Role[] = [];
    if (roleIds && roleIds.length > 0) {
      roles = await this.roleRepository.findByIds(roleIds);
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }
    }

    // Create user
    const user = this.userRepository.create({
      ...userData,
      email,
      hash: hashedPassword,
      roles,
      hashedRt: null,
    });

    return await this.userRepository.save(user);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.userRepository, {
      relations: {
        roles: true,
      },
      select: ['id', 'name', 'email', 'avatar', 'createdAt', 'updatedAt'],
      sortableColumns: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      searchableColumns: ['name', 'email'],
      defaultSortBy: [['id', 'DESC']],
      defaultLimit: 10,
      maxLimit: 100,
      filterableColumns: {
        'roles.name': true,
      },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        roles: true,
      },
      select: {
        id: true,
        avatar: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { password, roleIds, email, ...updateData } = updateUserDto;

    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      updateData['email'] = email;
    }

    // Hash password if provided
    if (password) {
      updateData['hash'] = await argon.hash(password);
    }

    // Update roles if provided
    if (roleIds !== undefined) {
      if (roleIds.length > 0) {
        const roles = await this.roleRepository.findByIds(roleIds);
        if (roles.length !== roleIds.length) {
          throw new BadRequestException('One or more roles not found');
        }
        user.roles = roles;
      } else {
        user.roles = [];
      }
    }

    // Update user data
    Object.assign(user, updateData);

    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);

    return { message: `User with ID ${id} has been deleted successfully` };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: {
        roles: {
          permissions: true,
        },
      },
      select: {
        id: true,
        avatar: true,
        email: true,
        name: true,
        hash: true,
        hashedRt: true,
        roles: {
          id: true,
          name: true,
          permissions: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    const hashedRt = refreshToken ? await argon.hash(refreshToken) : null;

    await this.userRepository.update(userId, {
      hashedRt,
    });
  }
}
