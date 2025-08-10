import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsString, 
  IsArray, 
  IsDateString, 
  IsEnum, 
  IsOptional, 
  ValidateNested,
  MaxLength 
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { MultiLocaleDto } from 'src/common/dto/multi-locale.dto';
import { NewsStatus } from 'src/databases/typeorm/entities/enums';

export class CreateNewsDto {
    @ApiProperty({
        description: 'News title in multiple languages',
        type: MultiLocaleDto
    })
    @ValidateNested()
    @Type(() => MultiLocaleDto)
    title: MultiLocaleDto;

    @ApiProperty({
        description: 'News description/content in multiple languages',
        type: MultiLocaleDto
    })
    @ValidateNested()
    @Type(() => MultiLocaleDto)
    description: MultiLocaleDto;

    @ApiProperty({
        description: 'Array of image URLs',
        example: ['/uploads/image1.jpg', '/uploads/image2.png'],
        type: [String],
        maxLength: 255
    })
    @IsArray()
    @IsString({ each: true })
    @MaxLength(255, { each: true })
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
    @IsEnum(NewsStatus)
    @IsOptional()
    status?: NewsStatus = NewsStatus.DRAFT;
}

export class UpdateNewsDto extends PartialType(CreateNewsDto) { }