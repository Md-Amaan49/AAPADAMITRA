import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class RegisterCitizenDto {
  @ApiProperty({ description: 'Full legal name of the citizen', example: 'Aarav Patil' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ description: 'Citizen email address', example: 'aarav.patil@example.in' })
  @IsEmail({}, { message: 'Must provide a valid email address' })
  email!: string;

  @ApiProperty({
    description: '10-digit Indian mobile number',
    example: '9876543210',
  })
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone must be a valid 10-digit Indian mobile number' })
  phone!: string;

  @ApiProperty({
    description: 'Password (minimum 8 characters, at least 1 letter and 1 number)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiProperty({
    description: 'Password confirmation matching password',
    example: 'SecurePass123!',
  })
  @IsString()
  confirmPassword!: string;

  @ApiPropertyOptional({ description: 'Optional residential address / district ward', example: 'Vishnupuri Ward 3, Nanded' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Consent to Terms of Service & Privacy Policy', example: true })
  @IsBoolean()
  termsAccepted!: boolean;
}
