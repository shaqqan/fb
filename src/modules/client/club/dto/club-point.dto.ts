import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNumberString, IsOptional, IsString, Matches } from "class-validator";
import { Exists } from "src/common/decorators/validators";
import { League } from "src/databases/typeorm/entities";
export class ClubPointDto {
    @ApiProperty({
        nullable: true
    })
    @IsOptional()
    @IsNumberString()
    @Exists(League, 'id')
    leagueId?: number;

    @ApiProperty({
        nullable: true
    })
    @IsOptional()
    @IsNumberString()
    @Exists(League, 'id')
    subLeagueId?: number;

    @ApiProperty({
        description: 'Season must be a 4-digit year',
        nullable: true
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}$/, { message: 'Season must be a 4-digit year' })
    season?: string;
}