import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class FloodPredictDto {
  @ApiProperty({
    description: 'Current river discharge at time t in m3/s (cumecs)',
    example: 450.5,
    minimum: 0,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  q_t!: number;

  @ApiProperty({
    description: 'River discharge 1 day prior (t-1) in m3/s (cumecs)',
    example: 410.2,
    minimum: 0,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  q_lag1!: number;

  @ApiProperty({
    description: 'River discharge 2 days prior (t-2) in m3/s (cumecs)',
    example: 380.0,
    minimum: 0,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  q_lag2!: number;

  @ApiProperty({
    description: 'River discharge 3 days prior (t-3) in m3/s (cumecs)',
    example: 350.1,
    minimum: 0,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  q_lag3!: number;

  @ApiPropertyOptional({
    description: 'Gauging station zero datum level in meters AMSL',
    example: 48.5,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  zero_gauge_m?: number;

  @ApiPropertyOptional({
    description: 'Upstream catchment drainage area in sq km',
    example: 12500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  catchment_sqkm?: number;

  @ApiPropertyOptional({
    description: 'Day of year (1-366)',
    example: 215,
    minimum: 1,
    maximum: 366,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(366)
  day_of_year?: number;

  @ApiPropertyOptional({
    description: 'Calendar month of observation (1-12)',
    example: 8,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    description: 'Name or identifier of gauging station',
    example: 'Vishnupuri Upstream Gauge',
  })
  @IsOptional()
  @IsString()
  station_name?: string | null;

  @ApiPropertyOptional({
    description: 'River or watercourse name',
    example: 'Godavari',
  })
  @IsOptional()
  @IsString()
  river_name?: string | null;
}
