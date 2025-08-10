import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import * as argon from 'argon2';
import { User } from '../../../databases/typeorm/entities';

import { AuthDto, SignUpDto } from './dto';
import { JwtPayload, Tokens } from '../../../common/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) { }

  async signup(dto: SignUpDto): Promise<Tokens> {
    const hash = await argon.hash(dto.password);

    const user = await this.userRepository
      .save({
        name: dto.name,
        email: dto.email,
        hash,
      })
      .catch((error) => {
        if (error && typeof error === 'object' && 'code' in error) {
          if (error.code === '23505') { // PostgreSQL unique constraint violation
            throw new ForbiddenException('Credentials incorrect');
          }
        }
        throw error;
      });

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async signin(dto: AuthDto) {
    const user = await this.userRepository.findOne({
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
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const passwordMatches = await argon.verify(user.hash, dto.password);
    if (!passwordMatches) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    const { hash, hashedRt, ...userWithoutSensitiveData } = user;

    const permissions = user.roles?.flatMap((role) => role.permissions.map((permission) => permission.name));
    const uniquePermissions = [...new Set(permissions)];

    const roles = user.roles?.map((role) => role.name) ?? [];

    return ({
      ...userWithoutSensitiveData,
      roles: roles,
      permissions: uniquePermissions,
      tokens,
    });
  }

  async logout(userId: number): Promise<boolean> {
    await this.userRepository.update(
      {
        id: userId,
        hashedRt: Not(IsNull()),
      },
      {
        hashedRt: null,
      },
    );
    return true;
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hash = await argon.hash(rt);
    await this.userRepository.update(
      {
        id: userId,
      },
      {
        hashedRt: hash,
      },
    );
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.AT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
