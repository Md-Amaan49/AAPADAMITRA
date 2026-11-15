import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Account registered email', example: 'citizen@example.in' })
  @IsEmail()
  email!: string;
}

