import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { Exists } from "src/common/decorators/validators";
import { League } from "src/databases/typeorm/entities";

export class ListClubDto {
    @ApiProperty({
        description: 'League ID',
        example: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @Exists(League, 'id')
    leagueId: number;
}