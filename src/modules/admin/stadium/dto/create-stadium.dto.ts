import { IsNotEmpty, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStadiumDto {
  @ApiProperty({
    description: 'Stadium name in multiple languages',
    example: { en: 'Old Trafford', uz: 'Old Trafford' }
  })
  @IsNotEmpty()
  @IsObject()
  name: any;

  @ApiProperty({
    description: 'Stadium address',
    example: 'Sir Matt Busby Way, Stretford, Manchester M16 0RA, UK'
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Stadium city',
    example: 'Manchester'
  })
  @IsNotEmpty()
  @IsString()
  city: string;
}
