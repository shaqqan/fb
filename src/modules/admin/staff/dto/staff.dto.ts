import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StaffStatus } from '../../../../databases/typeorm/entities';
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

export class CreateStaffDto {
    @ApiProperty({ 
        description: 'Full name of the staff member',
        example: 'John Doe'
    })
    @IsString()
    fullname: string;

    @ApiProperty({ 
        description: 'Position/role of the staff member',
        example: 'Head Coach'
    })
    @IsString()
    position: string;

    @ApiProperty({ 
        description: 'Staff member information/bio in multiple languages',
        type: JsonContentDto 
    })
    @ValidateNested()
    @Type(() => JsonContentDto)
    information: JsonContentDto;

    @ApiProperty({ 
        description: 'Staff member photo URL',
        example: '/uploads/staff-photo.jpg'
    })
    @IsString()
    image: string;

    @ApiProperty({ 
        description: 'Staff member contact phone number',
        example: '+998901234567'
    })
    @IsString()
    phone: string;

    @ApiProperty({ 
        description: 'Staff member contact email',
        example: 'john.doe@club.com'
    })
    @IsString()
    email: string;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
    @ApiProperty({ 
        description: 'Staff member status',
        enum: StaffStatus,
        example: StaffStatus.ACTIVE,
        required: false
    })
    @IsOptional()
    status?: StaffStatus;
}