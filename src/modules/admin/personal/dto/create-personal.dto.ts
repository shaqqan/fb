import { IsNotEmpty, IsString, IsObject, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonalDto {
  @ApiProperty({
    description: 'Full name in multiple languages',
    example: { en: 'John Doe', uz: 'Jon Do' }
  })
  @IsNotEmpty()
  @IsObject()
  fullName: any;

  @ApiProperty({
    description: 'Position in multiple languages',
    example: { en: 'Manager', uz: 'Menejer' }
  })
  @IsNotEmpty()
  @IsObject()
  position: any;

  @ApiProperty({
    description: 'Additional information in multiple languages',
    example: { en: 'Experienced manager', uz: 'Tajribali menejer' }
  })
  @IsOptional()
  @IsObject()
  information?: any;

  @ApiProperty({
    description: 'Phone number',
    example: '+998901234567'
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
