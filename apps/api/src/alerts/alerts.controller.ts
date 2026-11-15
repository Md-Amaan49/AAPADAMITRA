import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import {
  CreateAlertDto,
  ApproveAlertDto,
  RejectAlertDto,
  CreateIncidentReportDto,
  RespondIncidentDto,
} from './dto/alert.dto';

@ApiTags('Disaster Alerts & Incident Coordination')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('active')
  @ApiOperation({
    summary: 'Get active broadcast alerts filtered by district',
    description: 'Returns approved alerts with live onset and expiration timestamps. Filters by district.',
  })
  @ApiQuery({ name: 'district', required: false, description: 'District name (e.g. Nanded, Mumbai, or All)' })
  async getActiveAlerts(@Query('district') district?: string) {
    return this.alertsService.getActiveAlerts(district);
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Get pending AI prediction alerts awaiting authority approval (HITL)',
  })
  @ApiQuery({ name: 'district', required: false })
  async getPendingAlerts(@Query('district') district?: string) {
    return this.alertsService.getPendingAlerts(district);
  }

  @Post('propose')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit an AI or operator prediction alert proposal' })
  async createAlertProposal(@Body() dto: CreateAlertDto) {
    return this.alertsService.createAlertProposal(dto);
  }

  @Post('approve/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authority approves disaster alert and starts broadcast countdown' })
  async approveAlert(
    @Param('id') id: string,
    @Body() dto: ApproveAlertDto,
    @Req() req: any
  ) {
    return this.alertsService.approveAlert(id, dto, req.user);
  }

  @Post('reject/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authority rejects disaster alert proposal' })
  async rejectAlert(@Param('id') id: string, @Body() dto: RejectAlertDto) {
    return this.alertsService.rejectAlert(id, dto);
  }
}

@ApiTags('Citizen Incident Reporting & Authority Response')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('report')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Citizen reports a ground incident or hazard' })
  async reportIncident(@Body() dto: CreateIncidentReportDto, @Req() req: any) {
    return this.alertsService.reportIncident(dto, req.user);
  }

  @Get('my-reports')
  @ApiOperation({ summary: 'Citizen retrieves their reported incidents with official authority responses' })
  @ApiQuery({ name: 'phone', required: false })
  @ApiQuery({ name: 'citizenId', required: false })
  async getMyReports(
    @Query('phone') phone?: string,
    @Query('citizenId') citizenId?: string
  ) {
    return this.alertsService.getMyReports(phone, citizenId);
  }

  @Get('district/:district')
  @ApiOperation({ summary: 'Authority/Responder retrieves incidents in their district' })
  async getDistrictIncidents(@Param('district') district: string) {
    return this.alertsService.getDistrictIncidents(district);
  }

  @Post(':id/respond')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authority/Responder transmits official action/feedback to the citizen' })
  async respondToIncident(
    @Param('id') id: string,
    @Body() dto: RespondIncidentDto,
    @Req() req: any
  ) {
    return this.alertsService.respondToIncident(id, dto, req.user);
  }
}

