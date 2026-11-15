import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Single-use password reset token' })
  @IsString()
  token!: string;

  @ApiProperty({ description: 'New password (min 8 characters)', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({ description: 'Confirm new password' })
  @IsString()
  confirmPassword!: string;
}
