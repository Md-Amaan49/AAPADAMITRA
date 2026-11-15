/**
 * AAPADAMITRA — Normalized AI Prediction Response Contract
 * Unified internal shape that preserves all governance, audit provenance,
 * and scientific/statutory disclosures.
 */

import {
  HazardTypeKey,
  PredictionTriggerType,
  ModelExecutionTier,
  ModelPromotionStatus,
  DemonstrationStatus,
} from '../constants/ai-governance.constants';

export interface NormalizedPredictionResponse<TPrediction = any> {
  prediction_id?: string;
  hazard_type: HazardTypeKey;
  trigger_type: PredictionTriggerType;
  provider_status: string;
  model_name: string;
  model_version: string;
  execution_mode: ModelExecutionTier | string;
  production_status: ModelPromotionStatus | string;
  demonstration_status?: DemonstrationStatus | string;
  is_demonstration_only: boolean;
  prediction: TPrediction;
  input_data_status: 'VALID' | 'INSUFFICIENT_DATA' | 'STALE_DATA' | 'SYNTHETIC_DEMO';
  input_timestamp?: string;
  input_summary?: Record<string, any>;
  scientific_caveat: string;
  statutory_disclaimer: string;
  statutory_authority: string;
  created_at: string;
  persistence_status: 'PERSISTED' | 'NOT_PERSISTED' | 'DATABASE_UNAVAILABLE';
  provider_metadata?: {
    latency_ms: number;
    raw_response?: any;
    endpoint: string;
  };
}
