import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NewsStatus } from '../../../../databases/typeorm/entities';
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

export class CreateNewsDto {
    @ApiProperty()
    @ValidateNested()
    @Type(() => JsonContentDto)
    title: JsonContentDto;

    @ApiProperty()
    @ValidateNested()
    @Type(() => JsonContentDto)
    description: JsonContentDto;

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    images: string[];

    @ApiProperty()
    @IsOptional()
    @IsDateString()
    publishedAt?: string;

    @ApiProperty()
    @IsOptional()
    status?: NewsStatus;
}

export class UpdateNewsDto extends PartialType(CreateNewsDto) { }