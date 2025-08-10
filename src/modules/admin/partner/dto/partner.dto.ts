import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  ValidateNested, 
  IsOptional, 
  IsEnum,
  MaxLength 
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { MultiLocaleDto } from 'src/common/dto/multi-locale.dto';
import { PartnerStatus } from 'src/databases/typeorm/entities/enums';

export class CreatePartnerDto {
    @ApiProperty({
        description: 'Partner name in multiple languages',
        type: MultiLocaleDto
    })
    @ValidateNested()
    @Type(() => MultiLocaleDto)
    name: MultiLocaleDto;

    @ApiProperty({
        description: 'Partner description in multiple languages',
        type: MultiLocaleDto
    })
    @ValidateNested()
    @Type(() => MultiLocaleDto)
    description: MultiLocaleDto;

    @ApiProperty({
        description: 'Partner logo/image URL',
        example: '/uploads/partner-logo.png',
        maxLength: 255
    })
    @IsString()
    @MaxLength(255)
    image: string;

    @ApiProperty({
        description: 'Partner contact phone number',
        example: '+998901234567',
        maxLength: 20
    })
    @IsString()
    @MaxLength(20)
    phone: string;

    @ApiProperty({
        description: 'Partner contact email',
        example: 'contact@partner.com',
        maxLength: 100
    })
    @IsEmail()
    @MaxLength(100)
    email: string;
}

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {
    @ApiProperty({
        description: 'Partner status',
        enum: PartnerStatus,
        example: PartnerStatus.ACTIVE,
        required: false
    })
    @IsOptional()
    @IsEnum(PartnerStatus)
    status?: PartnerStatus = PartnerStatus.ACTIVE;
}