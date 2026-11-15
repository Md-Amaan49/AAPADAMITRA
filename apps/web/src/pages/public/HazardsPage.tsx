import React from 'react';
import { 
  Waves, 
  Wind, 
  Mountain, 
  Activity, 
  Flame, 
  AlertTriangle, 
  Info 
} from 'lucide-react';

export const HazardsPage: React.FC = () => {
  const hazards = [
    {
      id: 'flood',
      name: 'Riverine Flood & Dam Discharge',
      status: 'ACTIVE_PILOT',
      description: 'Monitors reservoir storage levels, gate openings, upstream rainfall, and river discharge along the Godavari basin downstream of Vishnupuri Barrage.',
      telemetry: 'Real-time Dam Water Level (m), Discharge (cusecs), Inflow Rate',
      aiModel: 'Inundation Severity Classification (Flood ML Service)',
      icon: <Waves size={24} color="#1d4ed8" />,
    },
    {
      id: 'cyclone',
      name: 'Tropical Cyclone & Storm Surge',
      status: 'AI_INTEGRATED',
      description: 'Tracks tropical cyclonic disturbances, central atmospheric pressure, sustained wind speeds, and projected landfall cones across coastal belts.',
      telemetry: 'IMD Coastal Radars, Barometric Pressure, Wind Vectors',
      aiModel: 'Saffir-Simpson Intensity & Radius Model (Cyclone ML Service)',
      icon: <Wind size={24} color="#0891b2" />,
    },
    {
      id: 'landslide',
      name: 'Landslide & Slope Instability',
      status: 'AI_INTEGRATED',
      description: 'Analyzes geotechnical slope angles, antecedent rainfall thresholds, soil moisture saturation, and geological fault line proximity.',
      telemetry: 'Soil Moisture Sensors, Piezometers, Rain Gauges',
      aiModel: 'Slope Failure Probability Classifier (Landslide ML Service)',
      icon: <Mountain size={24} color="#d97706" />,
    },
    {
      id: 'tsunami',
      name: 'Tsunami & Ocean Wave Dynamics',
      status: 'AI_INTEGRATED',
      description: 'Evaluates undersea seismic epicenters, ocean depth bathymetry, and estimated coastal arrival lead times.',
      telemetry: 'INCOIS Ocean Buoy Network, Bottom Pressure Recorders',
      aiModel: 'Wave Propagation & Arrival Time Estimation (Tsunami ML Service)',
      icon: <Waves size={24} color="#0284c7" />,
    },
    {
      id: 'earthquake',
      name: 'Earthquake & Seismic Tremors',
      status: 'REGISTRY_MONITORED',
      description: 'Ingests National Center for Seismology (NCS) seismic feeds, epicentral coordinates, focal depths, and Richter magnitude.',
      telemetry: 'Seismograph Network, Strong Motion Accelerographs',
      aiModel: 'Structural Vulnerability Assessment (Scheduled)',
      icon: <Activity size={24} color="#dc2626" />,
    },
    {
      id: 'forest_fire',
      name: 'Forest Fire & Wildfire',
      status: 'REGISTRY_MONITORED',
      description: 'Satellite thermal anomaly detection (MODIS/VIIRS) and forest canopy dryness index monitoring across reserved zones.',
      telemetry: 'FSI Thermal Infrared Remote Sensing, Humidity Indices',
      aiModel: 'Fire Spread Vector Model (Scheduled)',
      icon: <Flame size={24} color="#ea580c" />,
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
          <AlertTriangle size={16} />
          <span>Multi-Hazard Domain Registry</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>
          Monitored Hazard Domains &amp; AI Integration
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '850px', marginTop: '0.5rem' }}>
          AAPADAMITRA is engineered with a generic hazard classification framework. While Vishnupuri Dam prioritizes hydrological flood tracking, four advanced machine learning models are actively connected to the operational backend.
        </p>
      </div>

      {/* Distinction Banner */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <Info size={24} color="#1d4ed8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#1e3a8a' }}>
          <strong>Operational Distinction Notice:</strong> The platform clearly distinguishes between <em>Official Telemetry Readings</em> (direct ground truth from dam sensors, water level recorders, and statutory agencies like CWC / IMD) and <em>AI Predictive Scenarios</em> (probabilistic simulations for decision-support). AI predictions require manual verification before triggering alerts.
        </div>
      </div>

      {/* Hazard Cards Grid */}
      <div className="grid-2">
        {hazards.map((h) => (
          <div key={h.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {h.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {h.name}
                  </h3>
                </div>
              </div>

              <div>
                {h.status === 'ACTIVE_PILOT' && (
                  <span className="badge badge-operational">ACTIVE PILOT</span>
                )}
                {h.status === 'AI_INTEGRATED' && (
                  <span className="badge badge-info">AI INTEGRATED</span>
                )}
                {h.status === 'REGISTRY_MONITORED' && (
                  <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>MONITORED</span>
                )}
              </div>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {h.description}
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.85rem', marginTop: 'auto', fontSize: '0.8rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Ground Sensor Telemetry:</span>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{h.telemetry}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Connected AI Capability:</span>
                <div style={{ color: '#1d4ed8', fontWeight: 600 }}>{h.aiModel}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
