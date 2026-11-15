import React, { useState, useEffect } from 'react';
import {
  fetchAiHealth,
  fetchTriggerConfigs,
  executeManualPrediction,
} from '../services/apiClient';

interface HazardCardData {
  id: 'cyclone' | 'flood' | 'landslide' | 'tsunami';
  name: string;
  category: string;
  modelName: string;
  version: string;
  productionStatus: 'PROMOTED TO PRODUCTION' | 'NOT PROMOTED';
  isDemoOnly: boolean;
  statutoryAuthority: string;
  scientificCaveat: string;
  samplePayload: Record<string, any>;
}

const HAZARD_DEFINITIONS: HazardCardData[] = [
  {
    id: 'cyclone',
    name: 'Tropical Cyclone',
    category: 'Meteorological Hazard',
    modelName: 'cyclone_track_and_intensity_24h',
    version: 'v3.0',
    productionStatus: 'PROMOTED TO PRODUCTION',
    isDemoOnly: false,
    statutoryAuthority: 'India Meteorological Department (IMD) - RSMC New Delhi',
    scientificCaveat:
      'Candidate track error (136.5 km) outperforms operational persistence (161.84 km). Official warnings and landfalls are governed statutorily by IMD.',
    samplePayload: {
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
      storm_name: 'SAMPLE_STORM',
    },
  },
  {
    id: 'flood',
    name: 'River Basin Discharge',
    category: 'Hydrological Hazard',
    modelName: 'flood_discharge_rf',
    version: 'v3.0',
    productionStatus: 'NOT PROMOTED',
    isDemoOnly: true,
    statutoryAuthority: 'Central Water Commission (CWC) / NWIC',
    scientificCaveat:
      'DEMONSTRATION ONLY: Candidate NSE (0.9189) did not beat 1-day persistence benchmark (0.9229). Predicts river gauge discharge, NOT dam reservoir levels. Upstream gate releases are unobserved.',
    samplePayload: {
      q_t: 450.5,
      q_lag1: 410.2,
      q_lag2: 380.0,
      q_lag3: 350.1,
      zero_gauge_m: 48.5,
      catchment_sqkm: 12500,
      station_name: 'Vishnupuri Upstream Gauge',
      river_name: 'Godavari',
    },
  },
  {
    id: 'landslide',
    name: 'Slope Susceptibility',
    category: 'Geological Hazard',
    modelName: 'landslide_susceptibility',
    version: 'v3.0',
    productionStatus: 'NOT PROMOTED',
    isDemoOnly: true,
    statutoryAuthority: 'Geological Survey of India (GSI)',
    scientificCaveat:
      'DEMONSTRATION ONLY: Susceptibility screening. 1.0 PR-AUC is an artifact of synthetic non-landslide background sampling. Micro-topographic road cuts and localized cloudbursts are unobserved.',
    samplePayload: {
      elevation_dem_m: 850.0,
      slope_degrees: 32.5,
      aspect_degrees: 215.0,
      profile_curvature: -0.05,
      topographic_wetness_index: 7.2,
      antecedent_rainfall_3d_mm: 120.5,
      antecedent_rainfall_7d_mm: 245.0,
      soil_moisture_0_7cm_m3m3: 0.38,
      soil_moisture_rootzone_m3m3: 0.42,
      location_name: 'Wayanad Ghat Sector 4',
    },
  },
  {
    id: 'tsunami',
    name: 'Tsunami Early Screening',
    category: 'Oceanographic Hazard',
    modelName: 'tsunami_classifier_rf',
    version: 'v3.0',
    productionStatus: 'NOT PROMOTED',
    isDemoOnly: true,
    statutoryAuthority: 'Indian National Centre for Ocean Information Services (INCOIS) - ITEWC',
    scientificCaveat:
      'DEMONSTRATION ONLY: Candidate PR-AUC (0.6500) lower than baseline (0.6845). Point-source hypocenters do not represent fault rupture geometry or dynamic displacement.',
    samplePayload: {
      magnitude: 8.2,
      focal_depth_km: 15.0,
      epicenter_latitude: 3.3,
      epicenter_longitude: 95.8,
      gebco_bathymetry_m: -3500.0,
      distance_to_nearest_coast_km: 45.0,
      event_id: 'sample_seismic_screening_analogue',
    },
  },
];

export const AiPredictionsDashboard: React.FC = () => {
  const [selectedHazard, setSelectedHazard] = useState<HazardCardData>(HAZARD_DEFINITIONS[0]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [triggerConfigs, setTriggerConfigs] = useState<any>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAiHealth()
      .then(setHealthStatus)
      .catch(() => setHealthStatus({ status: 'UNAVAILABLE', provider_reachable: false }));

    fetchTriggerConfigs()
      .then(setTriggerConfigs)
      .catch(() => setTriggerConfigs(null));
  }, []);

  const handleRunManualPrediction = async () => {
    if (executing) return; // Prevent double clicks
    setExecuting(true);
    setErrorMessage(null);
    setPredictionResult(null);

    try {
      const res = await executeManualPrediction(
        selectedHazard.id,
        selectedHazard.samplePayload,
        'CONTROL_ROOM_OPERATOR'
      );
      setPredictionResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to execute prediction.');
    } finally {
      setExecuting(false);
    }
  };

  const autoConfig = triggerConfigs ? triggerConfigs[selectedHazard.id] : null;

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            Multi-Hazard AI Inference & Governance
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Decision-Support Integration Layer &bull; Independent Hosted FastAPI Service
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: healthStatus?.provider_reachable ? '#dcfce7' : '#fee2e2',
              color: healthStatus?.provider_reachable ? '#166534' : '#991b1b',
            }}
          >
            Provider API: {healthStatus?.status || 'CHECKING...'}
          </span>
        </div>
      </div>

      {/* Statutory Boundary Notice */}
      <div
        style={{
          padding: '0.85rem 1rem',
          backgroundColor: '#eff6ff',
          borderLeft: '4px solid #3b82f6',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          fontSize: '0.8rem',
          color: '#1e3a8a',
        }}
      >
        <strong>STATUTORY SAFETY NOTICE:</strong> AAPADAMITRA model outputs are strictly advisory
        decision-support aids. Official public warnings, watches, and evacuation advisories are
        governed exclusively by designated national authorities (IMD, CWC, GSI, INCOIS). Autonomous
        warning or actuator trigger is architecturally disabled.
      </div>

      {/* Hazard Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {HAZARD_DEFINITIONS.map((h) => {
          const isSelected = h.id === selectedHazard.id;
          return (
            <button
              key={h.id}
              onClick={() => {
                setSelectedHazard(h);
                setPredictionResult(null);
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                borderRadius: '8px',
                background: isSelected ? '#f8fafc' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
                {h.category}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>{h.name}</div>
              <div style={{ marginTop: '0.35rem' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: h.isDemoOnly ? '#fef3c7' : '#dcfce7',
                    color: h.isDemoOnly ? '#92400e' : '#15803d',
                  }}
                >
                  {h.isDemoOnly ? 'DEMONSTRATION ONLY' : 'PROMOTED TO PRODUCTION'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Hazard Details Card */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.25rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
              {selectedHazard.name} Inference Engine ({selectedHazard.version})
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Statutory Authority: <strong>{selectedHazard.statutoryAuthority}</strong>
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: autoConfig?.autoTriggerEnabled ? '#dcfce7' : '#f1f5f9',
                color: autoConfig?.autoTriggerEnabled ? '#166534' : '#475569',
                fontWeight: 600,
              }}
            >
              Auto-Trigger: {autoConfig?.autoTriggerEnabled ? 'ENABLED' : 'DISABLED (Data Ingest Pending)'}
            </span>
          </div>
        </div>

        {/* Scientific Limitation Alert */}
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: selectedHazard.isDemoOnly ? '#fffbeb' : '#f0fdf4',
            border: selectedHazard.isDemoOnly ? '1px solid #fde68a' : '1px solid #bbf7d0',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: selectedHazard.isDemoOnly ? '#78350f' : '#14532d',
          }}
        >
          <strong>Scientific Benchmark & Caveat:</strong> {selectedHazard.scientificCaveat}
        </div>

        {/* Action Panel */}
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Trigger: <strong>MANUAL (Role: CONTROL_ROOM_OPERATOR)</strong>
          </div>
          <button
            onClick={handleRunManualPrediction}
            disabled={executing}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: executing ? '#94a3b8' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: executing ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {executing ? 'Requesting Hosted Model...' : `Execute ${selectedHazard.name} Prediction`}
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: '#991b1b',
            }}
          >
            <strong>Execution Error:</strong> {errorMessage}
          </div>
        )}

        {/* Prediction Result Display */}
        {predictionResult && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                Normalized Inference Result ({predictionResult.execution_mode})
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  backgroundColor: predictionResult.persistence_status === 'PERSISTED' ? '#dcfce7' : '#fee2e2',
                  color: predictionResult.persistence_status === 'PERSISTED' ? '#166534' : '#991b1b',
                }}
              >
                DB: {predictionResult.persistence_status}
              </span>
            </div>

            <pre
              style={{
                fontSize: '0.75rem',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: '0.75rem',
                borderRadius: '4px',
                overflowX: 'auto',
                maxHeight: '260px',
              }}
            >
              {JSON.stringify(predictionResult.prediction, null, 2)}
            </pre>

            <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#64748b' }}>
              Generated: {predictionResult.created_at} &bull; Model: {predictionResult.model_name} (
              {predictionResult.model_version}) &bull; Latency: {predictionResult.provider_metadata?.latency_ms}ms
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
