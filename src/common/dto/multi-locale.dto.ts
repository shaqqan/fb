import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class MultiLocaleDto {
    @ApiProperty({ description: 'Content in English', example: 'John Doe' })
    @IsString()
    en: string;

    @ApiProperty({ description: 'Content in Russian', example: 'John Doe' })
    @IsString()
    ru: string;

    @ApiProperty({ description: 'Content in Qarqalpaq (Latin)', example: 'John Doe' })
    @IsString()
    qq: string;

    @ApiProperty({ description: 'Content in Qaraqalpaq (Cyrillic)', example: 'John Doe' })
    @IsString()
    kk: string;

    @ApiProperty({ description: 'Content in Uzbek', example: 'John Doe' })
    @IsString()
    uz: string;

    @ApiProperty({ description: 'Content in Uzbek (Cyrillic)', example: 'John Doe' })
    @IsString()
    oz: string;
}