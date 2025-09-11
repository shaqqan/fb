import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  ValidateNested
} from 'class-validator';
import { MultiLocaleDto } from 'src/common/dto/multi-locale.dto';

export class CreateAboutDto {
  @ApiProperty({
    description: 'About title in multiple languages',
    type: MultiLocaleDto
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MultiLocaleDto)
  title: MultiLocaleDto;

  @ApiProperty({
    description: 'About description in multiple languages',
    type: MultiLocaleDto
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MultiLocaleDto)
  description: MultiLocaleDto;
}
