import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class TsunamiPredictDto {
  @ApiProperty({
    description: 'Earthquake moment magnitude (Mw)',
    example: 8.2,
    minimum: 4.0,
    maximum: 10.0,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(4.0)
  @Max(10.0)
  magnitude!: number;

  @ApiProperty({
    description: 'Earthquake hypocentral focal depth in kilometers',
    example: 15.0,
    minimum: 0,
    maximum: 700,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(700)
  focal_depth_km!: number;

  @ApiProperty({
    description: 'Epicenter latitude coordinate in WGS84 degrees North',
    example: 3.3,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-90)
  @Max(90)
  epicenter_latitude!: number;

  @ApiProperty({
    description: 'Epicenter longitude coordinate in WGS84 degrees East',
    example: 95.8,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-180)
  @Max(180)
  epicenter_longitude!: number;

  @ApiProperty({
    description: 'Seafloor bathymetry depth at epicenter in meters (negative value for ocean depths)',
    example: -3500.0,
    minimum: -12000,
    maximum: 100,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-12000)
  @Max(100)
  gebco_bathymetry_m!: number;

  @ApiProperty({
    description: 'Great-circle distance from epicenter to nearest coastline in km',
    example: 45.0,
    minimum: 0,
    maximum: 20000,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(20000)
  distance_to_nearest_coast_km!: number;

  @ApiPropertyOptional({
    description: 'Seismic event identifier (e.g. USGS event ID)',
    example: 'us7000m9xx',
  })
  @IsOptional()
  @IsString()
  event_id?: string | null;
}
