import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Unique permission name', example: 'news.create' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Permission description', example: 'Ability to create news', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
