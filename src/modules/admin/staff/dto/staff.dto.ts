import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  ValidateNested, 
  IsOptional, 
  IsEnum,
  MaxLength 
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { MultiLocaleDto } from 'src/common/dto/multi-locale.dto';
import { StaffStatus } from 'src/databases/typeorm/entities/enums';

export class CreateStaffDto {
    @ApiProperty({
        description: 'Full name of the staff member',
        example: 'John Doe',
        maxLength: 100
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    fullname: string;

    @ApiProperty({
        description: 'Position/role of the staff member',
        example: 'Head Coach',
        maxLength: 100
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    position: string;

    @ApiProperty({
        description: 'Staff member information/bio in multiple languages',
        type: MultiLocaleDto
    })
    @ValidateNested()
    @Type(() => MultiLocaleDto)
    information: MultiLocaleDto;

    @ApiProperty({
        description: 'Staff member photo URL',
        example: '/uploads/staff-photo.jpg',
        maxLength: 255
    })
    @IsString()
    @MaxLength(255)
    image: string;

    @ApiProperty({
        description: 'Staff member contact phone number',
        example: '+998901234567',
        maxLength: 20
    })
    @IsString()
    @MaxLength(20)
    phone: string;

    @ApiProperty({
        description: 'Staff member contact email',
        example: 'john.doe@club.com',
        maxLength: 100
    })
    @IsString()
    @IsEmail()
    @MaxLength(100)
    email: string;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
    @ApiProperty({
        description: 'Staff member status',
        enum: StaffStatus,
        example: StaffStatus.ACTIVE,
        required: false
    })
    @IsOptional()
    @IsEnum(StaffStatus)
    status?: StaffStatus = StaffStatus.ACTIVE;
}