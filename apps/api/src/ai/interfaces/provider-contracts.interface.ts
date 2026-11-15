/**
 * AAPADAMITRA — Hosted Model API Contracts Interface
 * Reflects the exact hosted FastAPI OpenAPI schema.
 */

export interface HostedProviderHealthResponse {
  status: string;
  service: string;
  environment: string;
  uptime_seconds: number;
  memory_rss_mb: number;
  memory_limit_mb: number;
  memory_usage_pct: number;
  cyclone_model_loaded: boolean;
  flood_model_loaded: boolean;
  landslide_model_loaded: boolean;
  tsunami_model_loaded: boolean;
  demo_mode: boolean;
  model_version: string;
  active_hazard: string;
  timestamp_utc: string;
}

export interface HostedModelMetadata {
  hazard: string;
  model_name: string;
  version: string;
  production_status: string;
  is_active: boolean;
  demo_enabled: boolean;
  demo_status: string;
  promotion_rationale: string;
  available_endpoints: string[];
  statutory_authority: string;
}

export interface HostedModelsRegistryResponse {
  active_hazard_count: number;
  demonstration_hazard_count: number;
  total_hazards: number;
  models: Record<string, HostedModelMetadata>;
  system_note: string;
}

export interface HostedHazardCatalogItem {
  hazard: string;
  title: string;
  model_name: string;
  version: string;
  production_status: string;
  demo_enabled: boolean;
  demo_status: string;
  promotion_rationale: string;
  statutory_authority: string;
  endpoints: {
    predict: string;
    model_info: string;
  };
  key_metrics: Record<string, any>;
}

export interface HostedHazardsCatalogResponse {
  total_hazards: number;
  promoted_hazards_count: number;
  demonstration_hazards_count: number;
  operational_mode: string;
  hazards: HostedHazardCatalogItem[];
  system_note: string;
}

export interface HostedModelInfoResponse {
  hazard: string;
  model_name: string;
  version: string;
  execution_mode?: string;
  production_status: string;
  demonstration_status?: string;
  promotion_rationale?: string;
  lead_time_hours?: number;
  architecture?: string;
  features_required?: string[];
  feature_count?: number;
  training_split?: string;
  validation_protocol?: string;
  test_metrics?: Record<string, any>;
  baseline_metrics?: Record<string, any>;
  known_limitations?: string[];
  statutory_authority: string;
}

// Prediction Response Contracts from Hosted API

export interface CyclonePredictionsPayload {
  track_24h: {
    forecast_latitude: number;
    forecast_longitude: number;
    delta_lat: number;
    delta_lon: number;
    track_displacement_km: number;
  };
  intensity_24h: {
    forecast_wind_speed_kts: number;
    delta_wind_speed_kts: number;
    forecast_category_imd: string;
    forecast_central_pressure_hpa: number;
  };
  rapid_intensification: {
    ri_probability: number;
    ri_threshold_kts_24h: number;
    ri_alert: boolean;
    ri_potential: string;
  };
  overall_risk_level: string;
  confidence_score: number;
}

export interface HostedCycloneResponse {
  status: string;
  execution_mode: string;
  production_status: string;
  demonstration_status: string;
  model_version: string;
  storm_name?: string | null;
  input_summary: Record<string, any>;
  predictions: CyclonePredictionsPayload;
  reference_performance?: Record<string, any>;
  scientific_caveat: string;
  statutory_disclaimer: string;
  generated_at: string;
}

export interface FloodPredictionsPayload {
  forecast_discharge_m3_s: number;
  delta_from_current_m3_s: number;
  percent_change: number;
  threshold_exceedance: {
    warning_discharge_m3_s?: number;
    danger_discharge_m3_s?: number;
    warning_level_exceeded?: boolean;
    danger_level_exceeded?: boolean;
    alert_level?: string;
  };
  confidence_interval_90: {
    lower_m3_s: number;
    upper_m3_s: number;
  };
  risk_level: string;
  confidence_score: number;
}

export interface HostedFloodResponse {
  status: string;
  execution_mode: string;
  production_status: string;
  demonstration_status: string;
  model_version: string;
  forecast_horizon_hours: number;
  station_name?: string | null;
  river_name?: string | null;
  input_summary: Record<string, any>;
  predictions: FloodPredictionsPayload;
  reference_performance?: Record<string, any>;
  scientific_caveat: string;
  statutory_disclaimer: string;
  generated_at: string;
}

export interface LandslidePredictionsPayload {
  susceptibility_probability: number;
  susceptibility_tier: string;
  screening_alert: boolean;
  contributing_factors: Record<string, any>;
  confidence_score: number;
}

export interface HostedLandslideResponse {
  status: string;
  execution_mode: string;
  production_status: string;
  demonstration_status: string;
  model_version: string;
  location_name?: string | null;
  input_summary: Record<string, any>;
  predictions: LandslidePredictionsPayload;
  reference_performance?: Record<string, any>;
  scientific_caveat: string;
  statutory_disclaimer: string;
  generated_at: string;
}

export interface TsunamiPredictionsPayload {
  tsunami_probability: number;
  potential_classification: string;
  screening_alert: boolean;
  is_shallow_crustal: boolean;
  tsunami_potential_index: number;
  confidence_score: number;
}

export interface HostedTsunamiResponse {
  status: string;
  execution_mode: string;
  production_status: string;
  demonstration_status: string;
  model_version: string;
  event_id?: string | null;
  input_summary: Record<string, any>;
  predictions: TsunamiPredictionsPayload;
  reference_performance?: Record<string, any>;
  scientific_caveat: string;
  statutory_disclaimer: string;
  generated_at: string;
}
