import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  HazardTypeKey,
  PredictionTriggerType,
} from './constants/ai-governance.constants';

export interface HazardTriggerConfig {
  hazard: HazardTypeKey;
  autoTriggerEnabled: boolean;
  featureReadinessStatus: 'READY' | 'PARTIAL' | 'NOT_READY';
  missingPrerequisites: string[];
  cooldownMinutes: number;
  maxStalenessHours: number;
}

export interface TriggerEvaluationResult {
  eligible: boolean;
  hazard: HazardTypeKey;
  triggerType: PredictionTriggerType;
  fingerprint: string;
  reason?: string;
  skipCode?: 'DISABLED' | 'INSUFFICIENT_DATA' | 'STALE_DATA' | 'DUPLICATE_SNAPSHOT' | 'COOLDOWN_ACTIVE';
}

export interface TriggerAuditRecord {
  id: string;
  hazard: HazardTypeKey;
  triggerType: PredictionTriggerType;
  timestamp: string;
  fingerprint: string;
  eligible: boolean;
  reason?: string;
  skipCode?: string;
  requesterId?: string;
}

@Injectable()
export class AiTriggerService {
  private readonly logger = new Logger(AiTriggerService.name);

  // Per-hazard automatic trigger configuration.
  // CRITICAL: Defaulted to disabled until data-readiness checks pass.
  private readonly triggerConfigs: Record<HazardTypeKey, HazardTriggerConfig> = {
    [HazardTypeKey.CYCLONE]: {
      hazard: HazardTypeKey.CYCLONE,
      autoTriggerEnabled: false,
      featureReadinessStatus: 'PARTIAL',
      missingPrerequisites: [
        'Real-time IMD GTS/RSMC cyclone bulletin parser',
        'Automated JTWC/CIMSS vertical shear & SST grid ingest',
      ],
      cooldownMinutes: 60,
      maxStalenessHours: 6,
    },
    [HazardTypeKey.FLOOD]: {
      hazard: HazardTypeKey.FLOOD,
      autoTriggerEnabled: false,
      featureReadinessStatus: 'NOT_READY',
      missingPrerequisites: [
        'CWC/NWIC Godavari basin hydrological telemetry connector',
        'Daily lag sequence (q_t, q_lag1, q_lag2, q_lag3) pipeline',
      ],
      cooldownMinutes: 360,
      maxStalenessHours: 24,
    },
    [HazardTypeKey.LANDSLIDE]: {
      hazard: HazardTypeKey.LANDSLIDE,
      autoTriggerEnabled: false,
      featureReadinessStatus: 'NOT_READY',
      missingPrerequisites: [
        'High-resolution terrain DEM (ALOS/CartoDEM) extraction pipeline',
        'Soil moisture & 3d/7d antecedent precipitation continuous telemetry',
      ],
      cooldownMinutes: 720,
      maxStalenessHours: 12,
    },
    [HazardTypeKey.TSUNAMI]: {
      hazard: HazardTypeKey.TSUNAMI,
      autoTriggerEnabled: false,
      featureReadinessStatus: 'NOT_READY',
      missingPrerequisites: [
        'INCOIS-ITEWC / USGS real-time seismic feed listener',
        'GEBCO 15-arc-second bathymetry point sampling service',
      ],
      cooldownMinutes: 30,
      maxStalenessHours: 2,
    },
  };

  // Cache of recent fingerprints and timestamps for deduplication: fingerprint -> timestampMs
  private readonly recentSnapshots: Map<string, number> = new Map();
  // Audit log of trigger decisions
  private readonly triggerAuditLog: TriggerAuditRecord[] = [];
  private readonly maxAuditLogSize = 200;

  /**
   * Generates a deterministic SHA-256 fingerprint for a feature payload.
   */
  public generateFingerprint(hazard: HazardTypeKey, payload: Record<string, any>): string {
    const sortedKeys = Object.keys(payload).sort();
    const normalizedObj: Record<string, any> = {};
    for (const key of sortedKeys) {
      if (key !== 'timestamp_utc' && key !== 'event_id' && key !== 'storm_name') {
        normalizedObj[key] = payload[key];
      }
    }
    const serialized = JSON.stringify(normalizedObj);
    return crypto
      .createHash('sha256')
      .update(`${hazard}:${serialized}`)
      .digest('hex');
  }

  /**
   * Evaluates whether an incoming payload is eligible for automatic prediction execution.
   */
  public evaluateAutomaticTrigger(
    hazard: HazardTypeKey,
    payload: Record<string, any>,
    observationTimestamp?: string
  ): TriggerEvaluationResult {
    const config = this.triggerConfigs[hazard];
    const fingerprint = this.generateFingerprint(hazard, payload);
    const now = Date.now();

    // 1. Check if automatic trigger is enabled for this hazard
    if (!config.autoTriggerEnabled) {
      const result: TriggerEvaluationResult = {
        eligible: false,
        hazard,
        triggerType: PredictionTriggerType.AUTOMATIC,
        fingerprint,
        skipCode: 'DISABLED',
        reason: `Automatic prediction trigger for ${hazard} is disabled pending verified data pipeline readiness. Prerequisites missing: ${config.missingPrerequisites.join(', ')}`,
      };
      this.recordAudit(result);
      return result;
    }

    // 2. Check data staleness if observation timestamp is provided
    if (observationTimestamp) {
      const obsTime = new Date(observationTimestamp).getTime();
      const maxAgeMs = config.maxStalenessHours * 60 * 60 * 1000;
      if (isNaN(obsTime) || now - obsTime > maxAgeMs) {
        const result: TriggerEvaluationResult = {
          eligible: false,
          hazard,
          triggerType: PredictionTriggerType.AUTOMATIC,
          fingerprint,
          skipCode: 'STALE_DATA',
          reason: `Input observation is stale (${((now - obsTime) / 3600000).toFixed(1)}h old; limit is ${config.maxStalenessHours}h).`,
        };
        this.recordAudit(result);
        return result;
      }
    }

    // 3. Deduplication and cooldown check
    const lastTriggered = this.recentSnapshots.get(fingerprint);
    const cooldownMs = config.cooldownMinutes * 60 * 1000;
    if (lastTriggered && now - lastTriggered < cooldownMs) {
      const remainingMin = Math.ceil((cooldownMs - (now - lastTriggered)) / 60000);
      const result: TriggerEvaluationResult = {
        eligible: false,
        hazard,
        triggerType: PredictionTriggerType.AUTOMATIC,
        fingerprint,
        skipCode: 'DUPLICATE_SNAPSHOT',
        reason: `Equivalent snapshot already processed. Cooldown active for another ${remainingMin} minutes.`,
      };
      this.recordAudit(result);
      return result;
    }

    // Eligible!
    const result: TriggerEvaluationResult = {
      eligible: true,
      hazard,
      triggerType: PredictionTriggerType.AUTOMATIC,
      fingerprint,
    };

    // Update deduplication cache
    this.recentSnapshots.set(fingerprint, now);
    this.recordAudit(result);
    return result;
  }

  /**
   * Registers a manual trigger execution to update deduplication and audit tracking.
   */
  public registerManualTrigger(
    hazard: HazardTypeKey,
    payload: Record<string, any>,
    requesterId?: string
  ): { fingerprint: string } {
    const fingerprint = this.generateFingerprint(hazard, payload);
    this.recentSnapshots.set(fingerprint, Date.now());

    this.recordAudit({
      eligible: true,
      hazard,
      triggerType: PredictionTriggerType.MANUAL,
      fingerprint,
      requesterId,
    });

    return { fingerprint };
  }

  /**
   * Returns current trigger configurations and feature readiness.
   */
  public getConfigurations(): Record<HazardTypeKey, HazardTriggerConfig> {
    return { ...this.triggerConfigs };
  }

  /**
   * Returns recent trigger audit decisions.
   */
  public getAuditLog(): TriggerAuditRecord[] {
    return [...this.triggerAuditLog];
  }

  /**
   * Toggles automatic trigger for a hazard.
   */
  public setAutoTriggerEnabled(hazard: HazardTypeKey, enabled: boolean): HazardTriggerConfig {
    this.triggerConfigs[hazard].autoTriggerEnabled = enabled;
    this.logger.log(`Automatic trigger for ${hazard} set to: ${enabled}`);
    return this.triggerConfigs[hazard];
  }

  private recordAudit(result: {
    eligible: boolean;
    hazard: HazardTypeKey;
    triggerType: PredictionTriggerType;
    fingerprint: string;
    reason?: string;
    skipCode?: string;
    requesterId?: string;
  }) {
    const record: TriggerAuditRecord = {
      id: crypto.randomUUID(),
      hazard: result.hazard,
      triggerType: result.triggerType,
      timestamp: new Date().toISOString(),
      fingerprint: result.fingerprint,
      eligible: result.eligible,
      reason: result.reason,
      skipCode: result.skipCode,
      requesterId: result.requesterId,
    };

    this.triggerAuditLog.unshift(record);
    if (this.triggerAuditLog.length > this.maxAuditLogSize) {
      this.triggerAuditLog.pop();
    }
  }
}
