import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiHealthService } from './ai-health.service';
import { AiRegistryService } from './ai-registry.service';
import { AiTriggerService } from './ai-trigger.service';
import { AiAuthorizationGuard } from './guards/ai-authorization.guard';
import { CyclonePredictDto } from './dto/cyclone-predict.dto';
import { FloodPredictDto } from './dto/flood-predict.dto';
import { LandslidePredictDto } from './dto/landslide-predict.dto';
import { TsunamiPredictDto } from './dto/tsunami-predict.dto';
import { HazardTypeKey } from './constants/ai-governance.constants';

@ApiTags('Multi-Hazard AI Models')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly healthService: AiHealthService,
    private readonly registryService: AiRegistryService,
    private readonly triggerService: AiTriggerService
  ) {}

  @Get('health')
  @ApiOperation({
    summary: 'Check hosted AI Model API connectivity and runtime status',
    description:
      'Reports provider reachability separately from model readiness. Does NOT constitute statutory authorization.',
  })
  @ApiResponse({ status: 200, description: 'Hosted provider health check result' })
  async getHealth() {
    return this.healthService.checkHealth();
  }

  @Get('models')
  @ApiOperation({
    summary: 'Get AI model registry with governance promotion statuses',
    description:
      'Returns active models, promotion rationale, and transparent reconciliation of registry counts.',
  })
  @ApiResponse({ status: 200, description: 'Model registry metadata' })
  async getModels() {
    return this.registryService.getModels();
  }

  @Get('hazards')
  @ApiOperation({
    summary: 'Get hazard catalog and official statutory authorities',
    description:
      'Catalog of supported hazards (Cyclone, Flood, Landslide, Tsunami) mapped to statutory mandates.',
  })
  @ApiResponse({ status: 200, description: 'Hazard catalog' })
  async getHazards() {
    return this.registryService.getHazards();
  }

  @Get('models/:hazard/info')
  @ApiOperation({
    summary: 'Get detailed model info, architecture, and scientific caveats',
    description:
      'Provides benchmark metrics, baseline comparisons, known limitations, and statutory notices for a specific hazard.',
  })
  @ApiParam({
    name: 'hazard',
    enum: HazardTypeKey,
    description: 'Hazard type identifier (cyclone, flood, landslide, tsunami)',
  })
  @ApiResponse({ status: 200, description: 'Hazard model detailed specification' })
  async getModelInfo(@Param('hazard') hazard: HazardTypeKey) {
    return this.registryService.getModelInfo(hazard);
  }

  @Get('triggers/config')
  @ApiOperation({
    summary: 'Get automated prediction trigger configurations and feature readiness',
    description:
      'Inspects per-hazard cooldowns, staleness thresholds, and prerequisite telemetry requirements.',
  })
  async getTriggerConfigs() {
    return this.triggerService.getConfigurations();
  }

  @Get('triggers/audit')
  @ApiOperation({
    summary: 'Get recent prediction trigger audit decisions',
    description:
      'Audit log of manual and automatic triggers, including skipped evaluations and deduplication records.',
  })
  async getTriggerAuditLog() {
    return this.triggerService.getAuditLog();
  }

  @Post('cyclone/predict')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AiAuthorizationGuard)
  @ApiSecurity('Bearer')
  @ApiOperation({
    summary: 'Execute manual 24-hour Cyclone Track & Intensity Prediction',
    description:
      'PROMOTED TO PRODUCTION model: Predicts 24h storm track, central pressure, wind speed, and Rapid Intensification probability. Official warnings governed by IMD RSMC New Delhi.',
  })
  @ApiResponse({ status: 200, description: 'Normalized cyclone prediction outcome' })
  @ApiResponse({ status: 400, description: 'Input validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized or missing API credentials' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient role permissions' })
  async predictCyclone(@Body() dto: CyclonePredictDto, @Req() req: any) {
    return this.aiService.predictCyclone(dto, req.requester);
  }

  @Post('flood/predict')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AiAuthorizationGuard)
  @ApiSecurity('Bearer')
  @ApiOperation({
    summary: 'Execute manual Flood Gauging Station Discharge Forecast (+24h)',
    description:
      'DEMONSTRATION ONLY: Predicts 24-hour river discharge (cumecs). Candidate NSE (0.9189) did not beat operational persistence (0.9229). Statutory alerts governed by CWC.',
  })
  @ApiResponse({ status: 200, description: 'Normalized flood discharge prediction outcome' })
  @ApiResponse({ status: 400, description: 'Input validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized or missing API credentials' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient role permissions' })
  async predictFlood(@Body() dto: FloodPredictDto, @Req() req: any) {
    return this.aiService.predictFlood(dto, req.requester);
  }

  @Post('landslide/predict')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AiAuthorizationGuard)
  @ApiSecurity('Bearer')
  @ApiOperation({
    summary: 'Execute manual Landslide Susceptibility Screening',
    description:
      'DEMONSTRATION ONLY: Morphometric and antecedent rainfall susceptibility screening. 1.0 PR-AUC is a synthetic background artifact. Statutory advisories governed by GSI.',
  })
  @ApiResponse({ status: 200, description: 'Normalized landslide susceptibility screening outcome' })
  @ApiResponse({ status: 400, description: 'Input validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized or missing API credentials' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient role permissions' })
  async predictLandslide(@Body() dto: LandslidePredictDto, @Req() req: any) {
    return this.aiService.predictLandslide(dto, req.requester);
  }

  @Post('tsunami/predict')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AiAuthorizationGuard)
  @ApiSecurity('Bearer')
  @ApiOperation({
    summary: 'Execute manual Tsunami Potential Early Screening',
    description:
      'DEMONSTRATION ONLY: Hypocenter and bathymetry early screening. PR-AUC (0.6500) lower than baseline (0.6845). Official warnings governed by INCOIS - ITEWC.',
  })
  @ApiResponse({ status: 200, description: 'Normalized tsunami screening outcome' })
  @ApiResponse({ status: 400, description: 'Input validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized or missing API credentials' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient role permissions' })
  async predictTsunami(@Body() dto: TsunamiPredictDto, @Req() req: any) {
    return this.aiService.predictTsunami(dto, req.requester);
  }
}
