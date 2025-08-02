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
    @ApiProperty()
    @IsString()
    fullname: string;

    @ApiProperty()
    @IsString()
    position: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => JsonContentDto)
    information: JsonContentDto;

    @ApiProperty()
    @IsString()
    image: string;

    @ApiProperty()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsString()
    email: string;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
    @ApiProperty()
    @IsOptional()
    status?: StaffStatus;
}