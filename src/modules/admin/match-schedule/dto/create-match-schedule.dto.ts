import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsEnum, Min, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MatchStatus } from 'src/databases/typeorm/entities';
import { Exists } from 'src/common/decorators/validators';
import { Club, League, Stadium } from 'src/databases/typeorm/entities';

export class CreateMatchScheduleDto {
  @ApiProperty({
    description: 'Club ID',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Exists(Club, 'id')
  clubId: number;

  @ApiProperty({
    description: 'Club league ID',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Exists(League, 'id')
  clubLeagueId: number;

  @ApiProperty({
    description: 'Club sub league ID',
    example: 2
  })
  @IsOptional()
  @IsNumber()
  @Exists(League, 'id')
  clubSubLeagueId?: number;

  @ApiProperty({
    description: 'Club mini league ID',
    example: 3,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Exists(League, 'id')
  clubMiniLeagueId?: number | null;

  @ApiProperty({
    description: 'Opponent club ID',
    example: 3
  })
  @IsNotEmpty()
  @IsNumber()
  @Exists(Club, 'id')
  opponentClubId: number;

  @ApiProperty({
    description: 'Opponent league ID',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Exists(League, 'id')
  opponentLeagueId: number;

  @ApiProperty({
    description: 'Opponent sub league ID',
    example: 2
  })
  @IsOptional()
  @IsNumber()
  @Exists(League, 'id')
  opponentSubLeagueId?: number;

  @ApiProperty({
    description: 'Opponent mini league ID',
    example: 3,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Exists(League, 'id')
  opponentMiniLeagueId?: number | null;

  @ApiProperty({
    description: 'Match date and time',
    example: '2024-01-15T14:30:00Z'
  })
  @IsNotEmpty()
  @IsDateString()
  matchDate: string;

  @ApiProperty({
    description: 'Stadium ID',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Exists(Stadium, 'id')
  stadiumId: number;

  @ApiProperty({
    description: 'Match status',
    enum: MatchStatus,
    example: MatchStatus.SCHEDULED
  })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiProperty({
    description: 'Club score',
    example: 2,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({
    allowInfinity: false,
    allowNaN: false
  })
  @Min(0)
  clubScore?: number;

  @ApiProperty({
    description: 'Opponent club score',
    example: 1,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({
    allowInfinity: false,
    allowNaN: false
  })
  @Min(0)
  opponentClubScore?: number;

  @ApiProperty({
    description: 'File path',
    example: 'file.pdf',
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  file?: string;
}
