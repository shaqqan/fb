import { IsNotEmpty, IsString, IsObject, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { League } from 'src/databases/typeorm/entities';
import { Exists } from 'src/common/decorators/validators';

export class CreateClubDto {
  @ApiProperty({
    description: 'Club name in multiple languages',
    example: { en: 'Manchester United', uz: 'Manchester Yunayted' }
  })
  @IsNotEmpty()
  @IsObject()
  name: any;

  @ApiProperty({
    description: 'Club logo Path',
    example: 'logo.png'
  })
  @IsNotEmpty()
  @IsString()
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
