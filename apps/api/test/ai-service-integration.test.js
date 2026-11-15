const { describe, it } = require('node:test');
const assert = require('node:assert');

const { AiProviderClient } = require('../dist/ai/ai-provider.client');
const { AiService } = require('../dist/ai/ai.service');
const { AiTriggerService } = require('../dist/ai/ai-trigger.service');
const {
  HazardTypeKey,
  ModelPromotionStatus,
  ModelExecutionTier,
} = require('../dist/ai/constants/ai-governance.constants');

describe('AI Provider Client Security & Routing Suite', () => {
  it('identifies unconfigured API key safely without exposing secrets', () => {
    const mockConfig = {
      get: (key, defaultValue) => {
        if (key === 'AI_MODEL_API_BASE_URL') return 'https://aapadamitra-model-api.onrender.com';
        if (key === 'AI_MODEL_API_KEY') return '';
        if (key === 'AI_MODEL_API_TIMEOUT_MS') return 15000;
        return defaultValue;
      },
    };

    const client = new AiProviderClient(mockConfig);
    assert.strictEqual(client.isKeyConfigured(), false);
  });

  it('blocks protected prediction calls when API key is missing', async () => {
    const mockConfig = {
      get: (key, defaultValue) => {
        if (key === 'AI_MODEL_API_BASE_URL') return 'https://aapadamitra-model-api.onrender.com';
        if (key === 'AI_MODEL_API_KEY') return '';
        return defaultValue;
      },
    };

    const client = new AiProviderClient(mockConfig);
    await assert.rejects(
      async () => client.predictCyclone({ current_latitude: 18.8 }),
      /Protected prediction call blocked: AI_MODEL_API_KEY is not configured or pending rotation/
    );
  });
});

describe('AI Service Normalization & Governance Mapping Suite', () => {
  // Mock provider client returning deterministic simulated responses
  const mockProviderClient = {
    isKeyConfigured: () => true,
    predictCyclone: async (payload) => ({
      latencyMs: 120,
      data: {
        status: 'SUCCESS',
        execution_mode: 'PRODUCTION',
        production_status: 'PROMOTED TO PRODUCTION',
        demonstration_status: 'PRODUCTION_APPROVED',
        model_version: 'v3.0',
        storm_name: payload.storm_name || 'SIMULATED',
        input_summary: payload,
        predictions: {
          track_24h: { forecast_latitude: 19.5, forecast_longitude: 88.2, track_displacement_km: 140 },
          intensity_24h: { forecast_wind_speed_kts: 55, forecast_category_imd: 'Severe Cyclonic Storm' },
          rapid_intensification: { ri_probability: 0.15, ri_alert: false },
          overall_risk_level: 'HIGH',
          confidence_score: 0.88,
        },
        scientific_caveat: 'Official warnings governed by IMD RSMC New Delhi.',
        statutory_disclaimer: 'Official cyclone advisories are issued exclusively by IMD.',
        generated_at: '2026-11-15T06:00:00Z',
      },
    }),
    predictFlood: async (payload) => ({
      latencyMs: 95,
      data: {
        status: 'SUCCESS',
        execution_mode: 'DEMONSTRATION',
        production_status: 'NOT PROMOTED',
        demonstration_status: 'DEMONSTRATION_ACTIVE',
        model_version: 'v3.0',
        forecast_horizon_hours: 24,
        station_name: payload.station_name,
        input_summary: payload,
        predictions: {
          forecast_discharge_m3_s: 480.2,
          delta_from_current_m3_s: 30.0,
          percent_change: 6.6,
          threshold_exceedance: { alert_level: 'NORMAL' },
          confidence_interval_90: { lower_m3_s: 420.0, upper_m3_s: 540.0 },
          risk_level: 'LOW',
          confidence_score: 0.82,
        },
        scientific_caveat: 'Candidate model did not beat 1-day persistence (NSE 0.9189 vs 0.9229).',
        statutory_disclaimer: 'Statutory river level forecasts governed exclusively by CWC.',
        generated_at: '2026-11-15T06:00:00Z',
      },
    }),
    predictLandslide: async (payload) => ({
      latencyMs: 110,
      data: {
        status: 'SUCCESS',
        execution_mode: 'DEMONSTRATION',
        production_status: 'NOT PROMOTED',
        demonstration_status: 'DEMONSTRATION_ACTIVE',
        model_version: 'v3.0',
        location_name: payload.location_name,
        input_summary: payload,
        predictions: {
          susceptibility_probability: 0.72,
          susceptibility_tier: 'HIGH',
          screening_alert: true,
          contributing_factors: { slope: 32.5, rainfall_7d: 245.0 },
          confidence_score: 0.79,
        },
        scientific_caveat: '1.0 PR-AUC is an artifact of synthetic background sampling.',
        statutory_disclaimer: 'Statutory landslide early warnings in India governed by GSI.',
        generated_at: '2026-11-15T06:00:00Z',
      },
    }),
    predictTsunami: async (payload) => ({
      latencyMs: 85,
      data: {
        status: 'SUCCESS',
        execution_mode: 'DEMONSTRATION',
        production_status: 'NOT PROMOTED',
        demonstration_status: 'DEMONSTRATION_ACTIVE',
        model_version: 'v3.0',
        event_id: payload.event_id,
        input_summary: payload,
        predictions: {
          tsunami_probability: 0.61,
          potential_classification: 'TSUNAMI_POTENTIAL_DETECTED',
          screening_alert: true,
          is_shallow_crustal: true,
          tsunami_potential_index: 3.8,
          confidence_score: 0.75,
        },
        scientific_caveat: 'Candidate PR-AUC (0.6500) did not exceed pre-existing benchmark (0.6845).',
        statutory_disclaimer: 'Official tsunami warnings in India governed exclusively by INCOIS - ITEWC.',
        generated_at: '2026-11-15T06:00:00Z',
      },
    }),
  };

  const mockTriggerService = new AiTriggerService();
  const mockPrismaDisconnected = {
    checkHealth: async () => ({ status: 'disconnected', error: 'Database unauthenticated' }),
  };

  const aiService = new AiService(
    mockProviderClient,
    mockTriggerService,
    mockPrismaDisconnected
  );

  it('normalizes cyclone prediction with PROMOTED TO PRODUCTION status', async () => {
    const res = await aiService.predictCyclone(
      {
        current_latitude: 18.8,
        current_longitude: 89.4,
        current_wind_speed_kts_3min: 35.0,
        current_central_pressure_hpa: 993,
        dist2land_km: 300,
        translation_speed_kts: 10,
        heading_degrees: 315,
        sea_surface_temperature_c: 29.0,
        vertical_wind_shear_kts: 15.0,
        relative_humidity_700hpa_pct: 80.0,
        storm_name: 'TEST_CYCLONE',
      },
      { userId: 'test_operator_1', role: 'CONTROL_ROOM_OPERATOR' }
    );

    assert.strictEqual(res.hazard_type, HazardTypeKey.CYCLONE);
    assert.strictEqual(res.is_demonstration_only, false);
    assert.strictEqual(res.production_status, ModelPromotionStatus.PROMOTED);
    assert.strictEqual(res.execution_mode, ModelExecutionTier.PRODUCTION);
    assert.strictEqual(res.persistence_status, 'DATABASE_UNAVAILABLE');
    assert.ok(res.prediction.track_24h);
    assert.ok(res.statutory_authority.includes('IMD'));
  });

  it('normalizes flood prediction with DEMONSTRATION ONLY label and persists gracefully', async () => {
    const res = await aiService.predictFlood(
      {
        q_t: 450,
        q_lag1: 410,
        q_lag2: 380,
        q_lag3: 350,
        station_name: 'Vishnupuri Upstream Gauge',
      },
      { userId: 'test_operator_1', role: 'CONTROL_ROOM_OPERATOR' }
    );

    assert.strictEqual(res.hazard_type, HazardTypeKey.FLOOD);
    assert.strictEqual(res.is_demonstration_only, true);
    assert.strictEqual(res.production_status, ModelPromotionStatus.NOT_PROMOTED);
    assert.strictEqual(res.execution_mode, ModelExecutionTier.DEMONSTRATION);
    assert.ok(res.scientific_caveat.includes('0.9189'));
    assert.ok(res.statutory_authority.includes('CWC'));
  });

  it('normalizes landslide screening with synthetic artifact caveat and demonstration label', async () => {
    const res = await aiService.predictLandslide(
      {
        elevation_dem_m: 850,
        slope_degrees: 32,
        aspect_degrees: 200,
        profile_curvature: 0,
        topographic_wetness_index: 7,
        antecedent_rainfall_3d_mm: 120,
        antecedent_rainfall_7d_mm: 240,
        soil_moisture_0_7cm_m3m3: 0.4,
        soil_moisture_rootzone_m3m3: 0.45,
        location_name: 'Wayanad Sector 4',
      },
      { userId: 'test_operator_1', role: 'CONTROL_ROOM_OPERATOR' }
    );

    assert.strictEqual(res.hazard_type, HazardTypeKey.LANDSLIDE);
    assert.strictEqual(res.is_demonstration_only, true);
    assert.ok(res.scientific_caveat.includes('synthetic'));
    assert.ok(res.statutory_authority.includes('GSI'));
  });

  it('normalizes tsunami screening with PR-AUC limitation and INCOIS statutory notice', async () => {
    const res = await aiService.predictTsunami(
      {
        magnitude: 8.2,
        focal_depth_km: 15,
        epicenter_latitude: 3.3,
        epicenter_longitude: 95.8,
        gebco_bathymetry_m: -3500,
        distance_to_nearest_coast_km: 45,
        event_id: 'us7000m9xx',
      },
      { userId: 'test_operator_1', role: 'CONTROL_ROOM_OPERATOR' }
    );

    assert.strictEqual(res.hazard_type, HazardTypeKey.TSUNAMI);
    assert.strictEqual(res.is_demonstration_only, true);
    assert.ok(res.scientific_caveat.includes('0.6500'));
    assert.ok(res.statutory_authority.includes('INCOIS'));
  });
});
