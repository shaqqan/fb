import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';
import { Exists } from 'src/common/decorators/validators';
import { League } from 'src/databases/typeorm/entities';

export class ListClubDto {
  @ApiProperty({
    description: 'League ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumberString()
  @Exists(League, 'id')
  leagueId: number;

  @ApiProperty({
    description: 'Sub League ID',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  @Exists(League, 'id')
  subLeagueId?: number;
}
