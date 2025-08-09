import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMatchScoreDto {
  @ApiProperty({
    description: 'Club score',
    example: 2,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  clubScore: number;

  @ApiProperty({
    description: 'Opponent club score',
    example: 1,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  opponentClubScore: number;
}
