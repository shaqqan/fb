import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsOptional, 
  ValidateNested, 
  IsPositive,
  MaxLength 
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { MultiLocaleDto } from 'src/common/dto/multi-locale.dto';
import { Exists } from 'src/common/decorators/validators';
import { League } from 'src/databases/typeorm/entities';

export class CreateLeagueDto {
    @ApiProperty({ 
        description: 'League title in multiple languages',
        type: MultiLocaleDto 
    })
    @ValidateNested()
    @Type(() => MultiLocaleDto)
    title: MultiLocaleDto;

    @ApiProperty({ 
        description: 'League logo URL',
        example: '/uploads/league-logo.png',
        maxLength: 255
    })
    @IsString()
    @MaxLength(255)
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
    @Exists(League, 'id')
    parentLeagueId?: number;
}

export class UpdateLeagueDto extends PartialType(CreateLeagueDto) { }