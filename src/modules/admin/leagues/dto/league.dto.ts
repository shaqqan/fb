import { IsString, ValidateNested, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class JsonContentDto {
    @ApiProperty({ description: 'Content in Russian', example: 'Чемпионат России' })
    @IsString()
    ru: string;

    @ApiProperty({ description: 'Content in English', example: 'Russian Championship' })
    @IsString()
    en: string;

    @ApiProperty({ description: 'Content in Qara-Qalpaq', example: 'Qaraqalpaq čempionatı' })
    @IsString()
    qq: string;

    @ApiProperty({ description: 'Content in Kazakh', example: 'Ресей чемпионаты' })
    @IsString()
    kk: string;

    @ApiProperty({ description: 'Content in Uzbek (Latin)', example: 'Rossiya chempionati' })
    @IsString()
    uz: string;

    @ApiProperty({ description: 'Content in Uzbek (Cyrillic)', example: 'Россия чемпионати' })
    @IsString()
    oz: string;
}

export class CreateLeagueDto {
    @ApiProperty({ 
        description: 'League title in multiple languages',
        type: JsonContentDto 
    })
    @ValidateNested()
    @Type(() => JsonContentDto)
    title: JsonContentDto;

    @ApiProperty({ 
        description: 'League logo URL',
        example: '/uploads/league-logo.png'
    })
    @IsString()
    logo: string;

    @ApiProperty({ 
        description: 'Parent league ID for hierarchical structure',
        example: 1,
        required: false,
        type: 'number'
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    parentLeagueId?: number;
}

export class UpdateLeagueDto extends PartialType(CreateLeagueDto) { }