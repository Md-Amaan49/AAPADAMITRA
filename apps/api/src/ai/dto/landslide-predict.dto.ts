import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class LandslidePredictDto {
  @ApiProperty({
    description: 'Digital Elevation Model (DEM) ground elevation in meters',
    example: 850.0,
    minimum: -500,
    maximum: 9000,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-500)
  @Max(9000)
  elevation_dem_m!: number;

  @ApiProperty({
    description: 'Terrain slope angle in degrees (0-90)',
    example: 32.5,
    minimum: 0,
    maximum: 90,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(90)
  slope_degrees!: number;

  @ApiProperty({
    description: 'Terrain aspect orientation in degrees (0=North, 90=East, 180=South, 270=West)',
    example: 215.0,
    minimum: 0,
    maximum: 360,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(360)
  aspect_degrees!: number;

  @ApiProperty({
    description: 'Profile curvature (rate of slope change in direction of aspect, m^-1)',
    example: -0.05,
    minimum: -100,
    maximum: 100,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-100)
  @Max(100)
  profile_curvature!: number;

  @ApiProperty({
    description: 'Topographic Wetness Index (TWI = ln(a / tan(beta)))',
    example: 7.2,
    minimum: 0,
    maximum: 35,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(35)
  topographic_wetness_index!: number;

  @ApiProperty({
    description: 'Cumulative antecedent precipitation over past 3 days (mm)',
    example: 120.5,
    minimum: 0,
    maximum: 2000,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(2000)
  antecedent_rainfall_3d_mm!: number;

  @ApiProperty({
    description: 'Cumulative antecedent precipitation over past 7 days (mm)',
    example: 245.0,
    minimum: 0,
    maximum: 3000,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(3000)
  antecedent_rainfall_7d_mm!: number;

  @ApiProperty({
    description: 'Volumetric soil moisture in topsoil (0-7 cm depth, m3/m3)',
    example: 0.38,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(1)
  soil_moisture_0_7cm_m3m3!: number;

  @ApiProperty({
    description: 'Volumetric soil moisture in root zone layer (m3/m3)',
    example: 0.42,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(1)
  soil_moisture_rootzone_m3m3!: number;

  @ApiPropertyOptional({
    description: 'Estimated regolith/soil thickness in meters (0-50)',
    example: 2.5,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(50)
  soil_thickness_m?: number;

  @ApiPropertyOptional({
    description: 'Name or descriptor of the monitored slope or administrative sector',
    example: 'Wayanad Ghat Sector 4',
  })
  @IsOptional()
  @IsString()
  location_name?: string | null;

  @ApiPropertyOptional({
    description: 'Geographic latitude coordinate (WGS84 degrees)',
    example: 11.58,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-90)
  @Max(90)
  latitude?: number | null;

  @ApiPropertyOptional({
    description: 'Geographic longitude coordinate (WGS84 degrees)',
    example: 76.12,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-180)
  @Max(180)
  longitude?: number | null;
}
