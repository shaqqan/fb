import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNumberString, IsOptional } from "class-validator";
import { Exists } from "src/common/decorators/validators";
import { League } from "src/databases/typeorm/entities/league.entity";

export class SubLeagueListDto {
    @ApiProperty({
        description: 'Parent league ID',
        example: 1
    })
    @IsOptional()
    @IsNumberString()
    @Exists(League, 'id')
    parentLeagueId?: number;
}