const { describe, it } = require('node:test');
const assert = require('node:assert');
require('reflect-metadata');
const { validate } = require('class-validator');
const { plainToInstance } = require('class-transformer');

// Load compiled DTOs from dist
const { CyclonePredictDto } = require('../dist/ai/dto/cyclone-predict.dto');
const { FloodPredictDto } = require('../dist/ai/dto/flood-predict.dto');
const { LandslidePredictDto } = require('../dist/ai/dto/landslide-predict.dto');
const { TsunamiPredictDto } = require('../dist/ai/dto/tsunami-predict.dto');

describe('AI Request DTO Validation Suite', () => {
  describe('CyclonePredictDto', () => {
    it('accepts valid cyclone meteorological parameters', async () => {
      const validPayload = {
        current_latitude: 18.8,
        current_longitude: 89.4,
        current_wind_speed_kts_3min: 32.4,
        current_central_pressure_hpa: 993,
        dist2land_km: 314,
        translation_speed_kts: 10,
        heading_degrees: 315,
        sea_surface_temperature_c: 29.4,
        vertical_wind_shear_kts: 16.2,
        relative_humidity_700hpa_pct: 81.9,
        storm_name: 'REMAL',
      };
      const dto = plainToInstance(CyclonePredictDto, validPayload);
      const errors = await validate(dto);
      assert.strictEqual(errors.length, 0, `Expected 0 errors, got: ${JSON.stringify(errors)}`);
    });

    it('rejects out-of-range latitude and negative wind speed', async () => {
      const invalidPayload = {
        current_latitude: 95.0, // > 90
        current_longitude: 89.4,
        current_wind_speed_kts_3min: -5, // < 10
        current_central_pressure_hpa: 993,
        dist2land_km: 314,
        translation_speed_kts: 10,
        heading_degrees: 315,
        sea_surface_temperature_c: 29.4,
        vertical_wind_shear_kts: 16.2,
        relative_humidity_700hpa_pct: 81.9,
      };
      const dto = plainToInstance(CyclonePredictDto, invalidPayload);
      const errors = await validate(dto);
      assert.ok(errors.length >= 2, 'Expected at least 2 validation errors');
      const properties = errors.map((e) => e.property);
      assert.ok(properties.includes('current_latitude'));
      assert.ok(properties.includes('current_wind_speed_kts_3min'));
    });

    it('rejects missing mandatory fields', async () => {
      const incompletePayload = {
        current_latitude: 18.8,
        storm_name: 'TEST_STORM',
      };
      const dto = plainToInstance(CyclonePredictDto, incompletePayload);
      const errors = await validate(dto);
      assert.ok(errors.length > 5, 'Expected validation errors for missing mandatory fields');
    });
  });

  describe('FloodPredictDto', () => {
    it('accepts valid river discharge telemetry sequence', async () => {
      const validPayload = {
        q_t: 450.5,
        q_lag1: 410.2,
        q_lag2: 380.0,
        q_lag3: 350.1,
        station_name: 'Vishnupuri Upstream Gauge',
        river_name: 'Godavari',
      };
      const dto = plainToInstance(FloodPredictDto, validPayload);
      const errors = await validate(dto);
      assert.strictEqual(errors.length, 0);
    });

    it('rejects negative discharge values', async () => {
      const invalidPayload = {
        q_t: -100.0,
        q_lag1: 410.2,
        q_lag2: 380.0,
        q_lag3: 350.1,
      };
      const dto = plainToInstance(FloodPredictDto, invalidPayload);
      const errors = await validate(dto);
      assert.ok(errors.length >= 1);
      assert.strictEqual(errors[0].property, 'q_t');
    });
  });

  describe('LandslidePredictDto', () => {
    it('accepts valid slope and hydrometeorological parameters', async () => {
      const validPayload = {
        elevation_dem_m: 850.0,
        slope_degrees: 32.5,
        aspect_degrees: 215.0,
        profile_curvature: -0.05,
        topographic_wetness_index: 7.2,
        antecedent_rainfall_3d_mm: 120.5,
        antecedent_rainfall_7d_mm: 245.0,
        soil_moisture_0_7cm_m3m3: 0.38,
        soil_moisture_rootzone_m3m3: 0.42,
        location_name: 'Wayanad Sector 4',
      };
      const dto = plainToInstance(LandslidePredictDto, validPayload);
      const errors = await validate(dto);
      assert.strictEqual(errors.length, 0);
    });

    it('rejects invalid slope (> 90 degrees) and out-of-range soil moisture', async () => {
      const invalidPayload = {
        elevation_dem_m: 850.0,
        slope_degrees: 105.0, // > 90
        aspect_degrees: 215.0,
        profile_curvature: -0.05,
        topographic_wetness_index: 7.2,
        antecedent_rainfall_3d_mm: 120.5,
        antecedent_rainfall_7d_mm: 245.0,
        soil_moisture_0_7cm_m3m3: 1.8, // > 1
        soil_moisture_rootzone_m3m3: 0.42,
      };
      const dto = plainToInstance(LandslidePredictDto, invalidPayload);
      const errors = await validate(dto);
      assert.ok(errors.length >= 2);
    });
  });

  describe('TsunamiPredictDto', () => {
    it('accepts valid seismic hypocenter and bathymetric screening parameters', async () => {
      const validPayload = {
        magnitude: 8.2,
        focal_depth_km: 15.0,
        epicenter_latitude: 3.3,
        epicenter_longitude: 95.8,
        gebco_bathymetry_m: -3500.0,
        distance_to_nearest_coast_km: 45.0,
        event_id: 'us7000m9xx',
      };
      const dto = plainToInstance(TsunamiPredictDto, validPayload);
      const errors = await validate(dto);
      assert.strictEqual(errors.length, 0);
    });

    it('rejects earthquake magnitude below threshold (e.g. 3.2 < 4.0)', async () => {
      const invalidPayload = {
        magnitude: 3.2,
        focal_depth_km: 15.0,
        epicenter_latitude: 3.3,
        epicenter_longitude: 95.8,
        gebco_bathymetry_m: -3500.0,
        distance_to_nearest_coast_km: 45.0,
      };
      const dto = plainToInstance(TsunamiPredictDto, invalidPayload);
      const errors = await validate(dto);
      assert.ok(errors.length >= 1);
      assert.strictEqual(errors[0].property, 'magnitude');
    });
  });
});
