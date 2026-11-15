import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { AiProviderClient } from './ai-provider.client';
import { AiTriggerService } from './ai-trigger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CyclonePredictDto } from './dto/cyclone-predict.dto';
import { FloodPredictDto } from './dto/flood-predict.dto';
import { LandslidePredictDto } from './dto/landslide-predict.dto';
import { TsunamiPredictDto } from './dto/tsunami-predict.dto';
import {
  HazardTypeKey,
  PredictionTriggerType,
  ModelExecutionTier,
  ModelPromotionStatus,
  DemonstrationStatus,
  STATUTORY_AUTHORITIES,
  SCIENTIFIC_CAVEATS,
} from './constants/ai-governance.constants';
import {
  HostedCycloneResponse,
  HostedFloodResponse,
  HostedLandslideResponse,
  HostedTsunamiResponse,
} from './interfaces/provider-contracts.interface';
import { NormalizedPredictionResponse } from './interfaces/normalized-prediction.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly providerClient: AiProviderClient,
    private readonly triggerService: AiTriggerService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Manual Cyclone Prediction Workflow
   */
  async predictCyclone(
    dto: CyclonePredictDto,
    requester?: { userId?: string; role?: string }
  ): Promise<NormalizedPredictionResponse<HostedCycloneResponse['predictions']>> {
    this.logger.log(`Executing manual cyclone prediction for storm: ${dto.storm_name || 'UNNAMED'}`);

    // Register with trigger service
    const { fingerprint } = this.triggerService.registerManualTrigger(
      HazardTypeKey.CYCLONE,
      dto,
      requester?.userId
    );

    const { data, latencyMs } = await this.providerClient.predictCyclone(dto);

    return this.buildNormalizedResponse<HostedCycloneResponse['predictions']>({
      hazard: HazardTypeKey.CYCLONE,
      triggerType: PredictionTriggerType.MANUAL,
      providerStatus: data.status,
      modelName: 'cyclone_track_and_intensity_24h',
      modelVersion: data.model_version || 'v3.0',
      executionMode: data.execution_mode || ModelExecutionTier.PRODUCTION,
      productionStatus: data.production_status || ModelPromotionStatus.PROMOTED,
      demonstrationStatus: data.demonstration_status || DemonstrationStatus.PRODUCTION_APPROVED,
      isDemonstrationOnly: false,
      prediction: data.predictions,
      inputDataStatus: 'VALID',
      inputTimestamp: dto.timestamp_utc || undefined,
      inputSummary: data.input_summary,
      scientificCaveat: data.scientific_caveat || SCIENTIFIC_CAVEATS[HazardTypeKey.CYCLONE],
      statutoryDisclaimer:
        data.statutory_disclaimer || STATUTORY_AUTHORITIES[HazardTypeKey.CYCLONE].warningNotice,
      statutoryAuthority: STATUTORY_AUTHORITIES[HazardTypeKey.CYCLONE].authorityName,
      createdAt: data.generated_at || new Date().toISOString(),
      fingerprint,
      latencyMs,
      endpoint: '/api/v1/cyclone/predict',
      requester,
      rawResponse: data,
    });
  }

  /**
   * Manual Flood Prediction Workflow
   */
  async predictFlood(
    dto: FloodPredictDto,
    requester?: { userId?: string; role?: string }
  ): Promise<NormalizedPredictionResponse<HostedFloodResponse['predictions']>> {
    this.logger.log(`Executing manual flood discharge prediction for station: ${dto.station_name || 'UNNAMED'}`);

    const { fingerprint } = this.triggerService.registerManualTrigger(
      HazardTypeKey.FLOOD,
      dto,
      requester?.userId
    );

    const { data, latencyMs } = await this.providerClient.predictFlood(dto);

    return this.buildNormalizedResponse<HostedFloodResponse['predictions']>({
      hazard: HazardTypeKey.FLOOD,
      triggerType: PredictionTriggerType.MANUAL,
      providerStatus: data.status,
      modelName: 'flood_discharge_rf',
      modelVersion: data.model_version || 'v3.0',
      executionMode: data.execution_mode || ModelExecutionTier.DEMONSTRATION,
      productionStatus: data.production_status || ModelPromotionStatus.NOT_PROMOTED,
      demonstrationStatus: data.demonstration_status || DemonstrationStatus.DEMONSTRATION_ACTIVE,
      isDemonstrationOnly: true,
      prediction: data.predictions,
      inputDataStatus: 'VALID',
      inputSummary: data.input_summary,
      scientificCaveat: data.scientific_caveat || SCIENTIFIC_CAVEATS[HazardTypeKey.FLOOD],
      statutoryDisclaimer:
        data.statutory_disclaimer || STATUTORY_AUTHORITIES[HazardTypeKey.FLOOD].warningNotice,
      statutoryAuthority: STATUTORY_AUTHORITIES[HazardTypeKey.FLOOD].authorityName,
      createdAt: data.generated_at || new Date().toISOString(),
      fingerprint,
      latencyMs,
      endpoint: '/api/v1/flood/predict',
      requester,
      rawResponse: data,
    });
  }

  /**
   * Manual Landslide Prediction Workflow
   */
  async predictLandslide(
    dto: LandslidePredictDto,
    requester?: { userId?: string; role?: string }
  ): Promise<NormalizedPredictionResponse<HostedLandslideResponse['predictions']>> {
    this.logger.log(`Executing manual landslide susceptibility screening for: ${dto.location_name || 'UNNAMED'}`);

    const { fingerprint } = this.triggerService.registerManualTrigger(
      HazardTypeKey.LANDSLIDE,
      dto,
      requester?.userId
    );

    const { data, latencyMs } = await this.providerClient.predictLandslide(dto);

    return this.buildNormalizedResponse<HostedLandslideResponse['predictions']>({
      hazard: HazardTypeKey.LANDSLIDE,
      triggerType: PredictionTriggerType.MANUAL,
      providerStatus: data.status,
      modelName: 'landslide_susceptibility',
      modelVersion: data.model_version || 'v3.0',
      executionMode: data.execution_mode || ModelExecutionTier.DEMONSTRATION,
      productionStatus: data.production_status || ModelPromotionStatus.NOT_PROMOTED,
      demonstrationStatus: data.demonstration_status || DemonstrationStatus.DEMONSTRATION_ACTIVE,
      isDemonstrationOnly: true,
      prediction: data.predictions,
      inputDataStatus: 'VALID',
      inputSummary: data.input_summary,
      scientificCaveat: data.scientific_caveat || SCIENTIFIC_CAVEATS[HazardTypeKey.LANDSLIDE],
      statutoryDisclaimer:
        data.statutory_disclaimer || STATUTORY_AUTHORITIES[HazardTypeKey.LANDSLIDE].warningNotice,
      statutoryAuthority: STATUTORY_AUTHORITIES[HazardTypeKey.LANDSLIDE].authorityName,
      createdAt: data.generated_at || new Date().toISOString(),
      fingerprint,
      latencyMs,
      endpoint: '/api/v1/landslide/predict',
      requester,
      rawResponse: data,
    });
  }

  /**
   * Manual Tsunami Prediction Workflow
   */
  async predictTsunami(
    dto: TsunamiPredictDto,
    requester?: { userId?: string; role?: string }
  ): Promise<NormalizedPredictionResponse<HostedTsunamiResponse['predictions']>> {
    this.logger.log(`Executing manual tsunami potential screening for event: ${dto.event_id || 'UNNAMED'}`);

    const { fingerprint } = this.triggerService.registerManualTrigger(
      HazardTypeKey.TSUNAMI,
      dto,
      requester?.userId
    );

    const { data, latencyMs } = await this.providerClient.predictTsunami(dto);

    return this.buildNormalizedResponse<HostedTsunamiResponse['predictions']>({
      hazard: HazardTypeKey.TSUNAMI,
      triggerType: PredictionTriggerType.MANUAL,
      providerStatus: data.status,
      modelName: 'tsunami_classifier_rf',
      modelVersion: data.model_version || 'v3.0',
      executionMode: data.execution_mode || ModelExecutionTier.DEMONSTRATION,
      productionStatus: data.production_status || ModelPromotionStatus.NOT_PROMOTED,
      demonstrationStatus: data.demonstration_status || DemonstrationStatus.DEMONSTRATION_ACTIVE,
      isDemonstrationOnly: true,
      prediction: data.predictions,
      inputDataStatus: 'VALID',
      inputSummary: data.input_summary,
      scientificCaveat: data.scientific_caveat || SCIENTIFIC_CAVEATS[HazardTypeKey.TSUNAMI],
      statutoryDisclaimer:
        data.statutory_disclaimer || STATUTORY_AUTHORITIES[HazardTypeKey.TSUNAMI].warningNotice,
      statutoryAuthority: STATUTORY_AUTHORITIES[HazardTypeKey.TSUNAMI].authorityName,
      createdAt: data.generated_at || new Date().toISOString(),
      fingerprint,
      latencyMs,
      endpoint: '/api/v1/tsunami/predict',
      requester,
      rawResponse: data,
    });
  }

  /**
   * Internal Normalization and Conditional Persistence Orchestration
   */
  private async buildNormalizedResponse<TPrediction>(params: {
    hazard: HazardTypeKey;
    triggerType: PredictionTriggerType;
    providerStatus: string;
    modelName: string;
    modelVersion: string;
    executionMode: string;
    productionStatus: string;
    demonstrationStatus?: string;
    isDemonstrationOnly: boolean;
    prediction: TPrediction;
    inputDataStatus: 'VALID' | 'INSUFFICIENT_DATA' | 'STALE_DATA' | 'SYNTHETIC_DEMO';
    inputTimestamp?: string;
    inputSummary?: Record<string, any>;
    scientificCaveat: string;
    statutoryDisclaimer: string;
    statutoryAuthority: string;
    createdAt: string;
    fingerprint: string;
    latencyMs: number;
    endpoint: string;
    requester?: { userId?: string; role?: string };
    rawResponse?: any;
  }): Promise<NormalizedPredictionResponse<TPrediction>> {
    const normalized: NormalizedPredictionResponse<TPrediction> = {
      hazard_type: params.hazard,
      trigger_type: params.triggerType,
      provider_status: params.providerStatus,
      model_name: params.modelName,
      model_version: params.modelVersion,
      execution_mode: params.executionMode,
      production_status: params.productionStatus,
      demonstration_status: params.demonstrationStatus,
      is_demonstration_only: params.isDemonstrationOnly,
      prediction: params.prediction,
      input_data_status: params.inputDataStatus,
      input_timestamp: params.inputTimestamp,
      input_summary: params.inputSummary,
      scientific_caveat: params.scientificCaveat,
      statutory_disclaimer: params.statutoryDisclaimer,
      statutory_authority: params.statutoryAuthority,
      created_at: params.createdAt,
      persistence_status: 'DATABASE_UNAVAILABLE',
      provider_metadata: {
        latency_ms: params.latencyMs,
        endpoint: params.endpoint,
        raw_response: params.rawResponse,
      },
    };

    // Attempt persistence if database is genuinely connected
    try {
      const dbHealth = await this.prisma.checkHealth();
      if (dbHealth.status === 'connected') {
        const persistedId = await this.persistPredictionRecord(normalized, params);
        if (persistedId) {
          normalized.prediction_id = persistedId;
          normalized.persistence_status = 'PERSISTED';
        }
      } else {
        this.logger.debug(
          `Database is disconnected (${dbHealth.error || 'unreachable'}). Prediction returned without persistence.`
        );
        normalized.persistence_status = 'DATABASE_UNAVAILABLE';
      }
    } catch (err: any) {
      this.logger.warn(`Database persistence check encountered error: ${err.message}`);
      normalized.persistence_status = 'DATABASE_UNAVAILABLE';
    }

    return normalized;
  }

  /**
   * Persists prediction record to PostgreSQL when database is online.
   */
  private async persistPredictionRecord(
    normalized: NormalizedPredictionResponse<any>,
    params: any
  ): Promise<string | null> {
    try {
      // Find or create hazard type record
      const hazardRecord = await this.prisma.hazardType.findFirst({
        where: { code: params.hazard.toUpperCase() },
      });

      if (!hazardRecord) {
        this.logger.debug(`HazardType ${params.hazard.toUpperCase()} not found in DB. Skipping persistence.`);
        return null;
      }

      // Find or create model version record
      const modelVer = await this.prisma.modelVersion.findFirst({
        where: {
          modelCode: params.modelName,
          version: params.modelVersion,
        },
      });

      if (!modelVer) {
        this.logger.debug(`ModelVersion ${params.modelName} ${params.modelVersion} not found in DB. Skipping persistence.`);
        return null;
      }

      const validFrom = new Date();
      const validTo = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const predictionRecord = await this.prisma.prediction.create({
        data: {
          modelVersionId: modelVer.id,
          hazardTypeId: hazardRecord.id,
          validFrom,
          validTo,
          horizonMinutes: 1440,
          status: 'GENERATED',
          riskCategory: 'MODERATE',
          confidenceScore: 0.85,
          limitations: params.scientificCaveat,
          provenanceMetadata: {
            fingerprint: params.fingerprint,
            trigger_type: params.triggerType,
            execution_mode: params.executionMode,
            production_status: params.productionStatus,
            demonstration_status: params.demonstrationStatus,
            requester_id: params.requester?.userId,
            scientific_caveat: params.scientificCaveat,
            statutory_disclaimer: params.statutoryDisclaimer,
            input_summary: params.inputSummary,
            provider_latency_ms: params.latencyMs,
          },
        },
      });

      return predictionRecord.id;
    } catch (err: any) {
      this.logger.warn(`Failed to persist prediction record: ${err.message}`);
      return null;
    }
  }
}
