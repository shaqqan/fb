import { Exclude, Expose, Type } from 'class-transformer';

export class RoleResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  avatar: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  @Type(() => RoleResponseDto)
  roles: RoleResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  hash: string;

  @Exclude()
  hashedRt: string;
}
