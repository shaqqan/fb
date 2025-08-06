import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'admin@example.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'admin123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignUpDto extends AuthDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
