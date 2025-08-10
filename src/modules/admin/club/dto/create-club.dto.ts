import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  ValidateNested, 
  IsOptional, 
  IsObject,
  MaxLength 
} from 'class-validator';
import { Exists } from 'src/common/decorators/validators';
import { MultiLocaleDto } from 'src/common/dto/multi-locale.dto';
import { League } from 'src/databases/typeorm/entities';

export class CreateClubDto {
  @ApiProperty({
    description: 'Club name in multiple languages',
    type: MultiLocaleDto
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MultiLocaleDto)
  name: MultiLocaleDto;

  @ApiProperty({
    description: 'Club logo Path',
    example: 'logo.png',
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  logo: string;

  @ApiProperty({
    description: 'League ID',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Exists(League, 'id')
  leagueId: number;

  @ApiProperty({
    description: 'Sub League ID',
    example: 2
  })
  @IsOptional()
  @IsNumber()
  @Exists(League, 'id')
  subLeagueId?: number;

  @ApiProperty({
    description: 'Club information in multiple languages',
    example: { en: 'Club description', uz: 'Klub tavsifi' }
  })
  @IsOptional()
  @IsObject()
  information?: any;
}
