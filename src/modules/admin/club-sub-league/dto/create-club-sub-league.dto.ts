import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClubSubLeagueDto {
    @ApiProperty({ 
        description: 'Club ID to link to sub-league',
        example: 1,
        type: 'number'
    })
    @IsNumber()
    @IsPositive()
    clubId: number;

    @ApiProperty({ 
        description: 'Sub-league ID to link to club',
        example: 1,
        type: 'number'
    })
    @IsNumber()
    @IsPositive()
    subLeagueId: number;
}
