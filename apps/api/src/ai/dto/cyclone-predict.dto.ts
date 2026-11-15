import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  IsISO8601,
} from 'class-validator';

export class CyclonePredictDto {
  @ApiProperty({
    description: 'Current storm center latitude in WGS84 degrees North',
    example: 18.8,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-90)
  @Max(90)
  current_latitude!: number;

  @ApiProperty({
    description: 'Current storm center longitude in WGS84 degrees East',
    example: 89.4,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-180)
  @Max(180)
  current_longitude!: number;

  @ApiProperty({
    description: 'Current 3-minute sustained maximum wind speed in knots (WMO/IMD standard)',
    example: 32.4,
    minimum: 10,
    maximum: 200,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(10)
  @Max(200)
  current_wind_speed_kts_3min!: number;

  @ApiProperty({
    description: 'Estimated minimum central barometric pressure in hectopascals (hPa / mb)',
    example: 993,
    minimum: 850,
    maximum: 1050,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(850)
  @Max(1050)
  current_central_pressure_hpa!: number;

  @ApiProperty({
    description: 'Great-circle distance to nearest major continental or island coastline in km',
    example: 314,
    minimum: 0,
    maximum: 5000,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(5000)
  dist2land_km!: number;

  @ApiProperty({
    description: 'Forward storm motion translation velocity over past 6h in knots',
    example: 10.0,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(100)
  translation_speed_kts!: number;

  @ApiProperty({
    description: 'Azimuthal direction of storm motion in degrees (0=North, 90=East, 180=South, 270=West)',
    example: 315.0,
    minimum: 0,
    maximum: 360,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(360)
  heading_degrees!: number;

  @ApiProperty({
    description: 'Underlying sea surface temperature (SST) in degrees Celsius',
    example: 29.4,
    minimum: 10,
    maximum: 40,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(10)
  @Max(40)
  sea_surface_temperature_c!: number;

  @ApiProperty({
    description: 'Environmental deep-layer vertical wind shear between 200 hPa and 850 hPa in knots',
    example: 16.2,
    minimum: 0,
    maximum: 150,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(150)
  vertical_wind_shear_kts!: number;

  @ApiProperty({
    description: 'Mid-tropospheric ambient relative humidity at 700 hPa isobaric level (0-100%)',
    example: 81.9,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(100)
  relative_humidity_700hpa_pct!: number;

  @ApiPropertyOptional({
    description: 'Optional operational storm identifier or named system (e.g. "REMAL", "MOCHA")',
    example: 'REMAL',
  })
  @IsOptional()
  @IsString()
  storm_name?: string | null;

  @ApiPropertyOptional({
    description: 'Optional observation timestamp in ISO 8601 UTC format (YYYY-MM-DDTHH:MM:SSZ)',
    example: '2024-05-25T12:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  timestamp_utc?: string | null;
}
