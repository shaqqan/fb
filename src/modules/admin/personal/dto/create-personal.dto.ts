import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  ValidateNested, 
  IsOptional,
  MaxLength 
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { MultiLocaleDto } from 'src/common/dto/multi-locale.dto';

export class CreatePersonalDto {
  @ApiProperty({
    description: 'Full name in multiple languages',
    type: MultiLocaleDto
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MultiLocaleDto)
  fullName: MultiLocaleDto;

  @ApiProperty({
    description: 'Position in multiple languages',
    type: MultiLocaleDto
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MultiLocaleDto)
  position: MultiLocaleDto;

  @ApiProperty({
    description: 'Additional information in multiple languages',
    type: MultiLocaleDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MultiLocaleDto)
  information?: MultiLocaleDto;

  @ApiProperty({
    description: 'Phone number',
    example: '+998901234567',
    maxLength: 20
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
    maxLength: 100
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;
}

export class UpdatePersonalDto extends PartialType(CreatePersonalDto) { }
