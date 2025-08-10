import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsString, 
  ValidateNested,
  MaxLength 
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { MultiLocaleDto } from 'src/common/dto/multi-locale.dto';

export class CreateStadiumDto {
  @ApiProperty({
    description: 'Stadium name in multiple languages',
    type: MultiLocaleDto
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MultiLocaleDto)
  name: MultiLocaleDto;

  @ApiProperty({
    description: 'Stadium address',
    example: 'Sir Matt Busby Way, Stretford, Manchester M16 0RA, UK',
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  address: string;

  @ApiProperty({
    description: 'Stadium city',
    example: 'Manchester',
    maxLength: 100
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;
}

export class UpdateStadiumDto extends PartialType(CreateStadiumDto) { }
