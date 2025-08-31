import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsNumberString } from "class-validator";
import { Exists } from "src/common/decorators/validators";
import { League } from "src/databases/typeorm/entities";

export class ListClubDto {
    @ApiProperty({
        description: 'League ID',
        example: 1
    })
    @IsNotEmpty()
    @IsNumberString()
    @Exists(League, 'id')
    leagueId: number;
}