import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'User account email', example: 'operator@aapadamitra.gov.in' })
  @IsEmail({}, { message: 'Must provide a valid email address' })
  email!: string;

  @ApiProperty({ description: 'User password', example: 'OperatorSecure123!' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @ApiPropertyOptional({ description: 'Remember session across browser re-openings', example: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
