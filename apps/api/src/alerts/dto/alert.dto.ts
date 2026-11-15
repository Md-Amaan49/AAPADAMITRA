import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';

export enum HazardTypeEnum {
  FLOOD = 'FLOOD',
  CYCLONE = 'CYCLONE',
  LANDSLIDE = 'LANDSLIDE',
  TSUNAMI = 'TSUNAMI',
  DROUGHT = 'DROUGHT',
}

export enum SeverityEnum {
  ADVISORY = 'ADVISORY',
  WATCH = 'WATCH',
  WARNING = 'WARNING',
  CRITICAL_EVACUATION = 'CRITICAL_EVACUATION',
}

export class CreateAlertDto {
  @ApiProperty({ enum: HazardTypeEnum, example: HazardTypeEnum.FLOOD })
  @IsEnum(HazardTypeEnum)
  hazardType!: HazardTypeEnum;

  @ApiProperty({ enum: SeverityEnum, example: SeverityEnum.WARNING })
  @IsEnum(SeverityEnum)
  severity!: SeverityEnum;

  @ApiProperty({ example: 'Vishnupuri Dam Gate Discharge Inundation Warning' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Discharge of 45,000 cusecs commenced. Riverbank inundation projected within 3 hours.' })
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @ApiProperty({ example: 'Nanded' })
  @IsString()
  @IsNotEmpty()
  district!: string;

  @ApiProperty({ example: ['Sangvi', 'Degaon', 'Vishnupuri Ghat'] })
  @IsArray()
  affectedAreas!: string[];

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  onsetMinutes?: number;

  @ApiPropertyOptional({ example: 'AI_MODEL' })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional({ example: 88.5 })
  @IsOptional()
  @IsNumber()
  confidenceScore?: number;
}

export class ApproveAlertDto {
  @ApiPropertyOptional({ description: 'Duration in hours until alert expires', example: 6 })
  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @ApiPropertyOptional({ description: 'Minutes until disaster onset begins', example: 30 })
  @IsOptional()
  @IsNumber()
  onsetMinutes?: number;

  @ApiPropertyOptional({ description: 'Custom advisory override by authority', example: 'Move livestock immediately to elevated relief zones.' })
  @IsOptional()
  @IsString()
  customAdvisory?: string;

  @ApiPropertyOptional({ example: 'District Collector Nanded' })
  @IsOptional()
  @IsString()
  approvedBy?: string;
}

export class RejectAlertDto {
  @ApiPropertyOptional({ example: 'Ground reality check confirmed safe river levels. Model prediction rejected.' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateIncidentReportDto {
  @ApiProperty({ example: 'Nanded' })
  @IsString()
  @IsNotEmpty()
  district!: string;

  @ApiProperty({ example: 'Near Sangvi Ghat Temple, Godavari bank' })
  @IsString()
  @IsNotEmpty()
  locality!: string;

  @ApiProperty({ example: 'WATERLOGGING' })
  @IsString()
  @IsNotEmpty()
  hazardType!: string;

  @ApiProperty({ example: 'Water has risen above the causeway by 1.5 feet. 4 elderly villagers stranded in house.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ example: 'HIGH' })
  @IsOptional()
  @IsString()
  urgency?: string;

  @ApiPropertyOptional({ example: 'Aarav Patil' })
  @IsOptional()
  @IsString()
  citizenName?: string;

  @ApiPropertyOptional({ example: '9822334455' })
  @IsOptional()
  @IsString()
  citizenPhone?: string;
}

export class RespondIncidentDto {
  @ApiProperty({ example: 'SDRF Boat Unit #2 dispatched to Sangvi Ghat with 4 rescue personnel.' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ example: 'DISPATCH_RESCUE_TEAM' })
  @IsString()
  @IsNotEmpty()
  actionTaken!: string;

  @ApiPropertyOptional({ example: 'INSPECTION_DISPATCHED' })
  @IsOptional()
  @IsString()
  newStatus?: string;

  @ApiPropertyOptional({ example: 'DEOC Commander Patil' })
  @IsOptional()
  @IsString()
  responderName?: string;
}

