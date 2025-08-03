import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NewsStatus } from '../../../../databases/typeorm/entities';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class JsonContentDto {
    @ApiProperty({ description: 'Content in Russian', example: 'Новость на русском языке' })
    @IsString()
    ru: string;

    @ApiProperty({ description: 'Content in English', example: 'News in English' })
    @IsString()
    en: string;

    @ApiProperty({ description: 'Content in Qara-Qalpaq', example: 'Qaraqalpaq tilinde jaŋalıq' })
    @IsString()
    qq: string;

    @ApiProperty({ description: 'Content in Kazakh', example: 'Қазақ тіліндегі жаңалық' })
    @IsString()
    kk: string;

    @ApiProperty({ description: 'Content in Uzbek (Latin)', example: 'O\'zbek tilida yangilik' })
    @IsString()
    uz: string;

    @ApiProperty({ description: 'Content in Uzbek (Cyrillic)', example: 'Ўзбек тилида янгилик' })
    @IsString()
    oz: string;
}

export class CreateNewsDto {
    @ApiProperty({ 
        description: 'News title in multiple languages',
        type: JsonContentDto 
    })
    @ValidateNested()
    @Type(() => JsonContentDto)
    title: JsonContentDto;

    @ApiProperty({ 
        description: 'News description/content in multiple languages',
        type: JsonContentDto 
    })
    @ValidateNested()
    @Type(() => JsonContentDto)
    description: JsonContentDto;

    @ApiProperty({ 
        description: 'Array of image URLs', 
        example: ['/uploads/image1.jpg', '/uploads/image2.png'],
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    images: string[];

    @ApiProperty({ 
        description: 'Scheduled publish date (ISO string). If not provided, will be published immediately',
        example: '2024-12-25T10:00:00.000Z',
        required: false
    })
    @IsOptional()
    @IsDateString()
    publishedAt?: string;

    @ApiProperty({ 
        description: 'News status',
        enum: NewsStatus,
        example: NewsStatus.DRAFT,
        required: false
    })
    @IsOptional()
    status?: NewsStatus;
}

export class UpdateNewsDto extends PartialType(CreateNewsDto) { }