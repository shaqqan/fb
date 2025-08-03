import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartnerStatus } from '../../../../databases/typeorm/entities';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class JsonContentDto {
    @ApiProperty()
    @IsString()
    ru: string;

    @ApiProperty()
    @IsString()
    en: string;

    @ApiProperty()
    @IsString()
    qq: string;

    @ApiProperty()
    @IsString()
    kk: string;

    @ApiProperty()
    @IsString()
    uz: string;

    @ApiProperty()
    @IsString()
    oz: string;
}

export class CreatePartnerDto {
    @ApiProperty({ 
        description: 'Partner name',
        example: 'Football Club Barcelona'
    })
    @IsString()
    name: string;

    @ApiProperty({ 
        description: 'Partner description in multiple languages',
        type: JsonContentDto 
    })
    @ValidateNested()
    @Type(() => JsonContentDto)
    description: JsonContentDto;

    @ApiProperty({ 
        description: 'Partner logo/image URL',
        example: '/uploads/partner-logo.png'
    })
    @IsString()
    image: string;

    @ApiProperty({ 
        description: 'Partner contact phone number',
        example: '+998901234567'
    })
    @IsString()
    phone: string;

    @ApiProperty({ 
        description: 'Partner contact email',
        example: 'contact@partner.com'
    })
    @IsString()
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
    status?: PartnerStatus;
}