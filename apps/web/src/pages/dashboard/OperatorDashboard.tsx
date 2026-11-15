import React, { useState } from 'react';
import { DashboardLayout } from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  Cpu, 
  FileCheck2, 
  Play, 
  CheckCircle2, 
  Send 
} from 'lucide-react';
import { executeManualPrediction } from '../../services/apiClient';

export const OperatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Vishnupuri Dam real-time operational state
  const [damState] = useState({
    waterLevel: 353.40,
    frl: 355.00,
    storageMcm: 63.3,
    storagePercent: 78.4,
    inflowCusecs: 4200,
    outflowCusecs: 2500,
    openGates: 4,
    totalGates: 18,
    gateHeightMeters: 1.2,
  });

  // AI Prediction trigger state
  const [selectedHazard, setSelectedHazard] = useState<'flood' | 'cyclone' | 'landslide' | 'tsunami'>('flood');
  const [floodInflow, setFloodInflow] = useState(4200);
  const [floodRainfall, setFloodRainfall] = useState(45.5);
  const [floodDownstreamCap, setFloodDownstreamCap] = useState(60000);

  const [cycloneWindSpeed, setCycloneWindSpeed] = useState(115);
  const [cyclonePressure, setCyclonePressure] = useState(975);

  const [landslideRainfall, setLandslideRainfall] = useState(130);
  const [landslideSlope, setLandslideSlope] = useState(38);

  const [tsunamiMagnitude, setTsunamiMagnitude] = useState(7.4);
  const [tsunamiDepth, setTsunamiDepth] = useState(25);

  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  // Operational log form
  const [logNotes, setLogNotes] = useState('');
  const [logList, setLogList] = useState<Array<{ id: string; time: string; text: string; operator: string }>>([
    {
      id: 'LOG-1',
      time: '11:00 AM IST',
      text: 'Radial gates #3, #4, #5, #6 opened to 1.2m. Downstream siren sounded prior to discharge.',
      operator: 'operator@aapadamitra.gov.in',
    },
    {
      id: 'LOG-2',
      time: '09:00 AM IST',
      text: 'Routine morning telemetry check complete. All 18 piezometers operational.',
      operator: 'operator@aapadamitra.gov.in',
    },
  ]);

  const handleRunPrediction = async () => {
    setIsPredicting(true);
    setPredictionResult(null);
    setPredictionError(null);
    setAlertSubmitted(false);

    let payload: any = {};
    if (selectedHazard === 'flood') {
      payload = {
        hazardType: 'FLOOD',
        damAssetId: 'dam-vishnupuri-01',
        inflowRateCusecs: Number(floodInflow),
        rainfall24hMm: Number(floodRainfall),
        downstreamRiverCapacityCusecs: Number(floodDownstreamCap),
      };
    } else if (selectedHazard === 'cyclone') {
      payload = {
        hazardType: 'CYCLONE',
        stormId: 'BOB-2026-02',
        sustainedWindSpeedKmph: Number(cycloneWindSpeed),
        centralPressureHpa: Number(cyclonePressure),
      };
    } else if (selectedHazard === 'landslide') {
      payload = {
        hazardType: 'LANDSLIDE',
        slopeAngleDegrees: Number(landslideSlope),
        antecedentRainfallMm: Number(landslideRainfall),
      };
    } else if (selectedHazard === 'tsunami') {
      payload = {
        hazardType: 'TSUNAMI',
        earthquakeMagnitude: Number(tsunamiMagnitude),
        focalDepthKm: Number(tsunamiDepth),
      };
    }

    try {
      const res = await executeManualPrediction(selectedHazard, payload);
      setPredictionResult(res);
    } catch (err: any) {
      setPredictionError(err.message || 'AI model prediction execution failed.');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleForwardToAuthority = () => {
    setAlertSubmitted(true);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logNotes.trim()) return;
    const newLog = {
      id: `LOG-${Date.now()}`,
      time: 'Just now',
      text: logNotes,
      operator: user?.email || 'operator@aapadamitra.gov.in',
    };
    setLogList([newLog, ...logList]);
    setLogNotes('');
  };

  return (
    <DashboardLayout
      title="Control Room Monitoring &amp; Telemetry Desk"
      subtitle={`Operator: ${user?.fullName || 'Control Officer'} &bull; Station: Vishnupuri Dam Site`}
      currentTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Overview Tab */}
      {(!activeTab || activeTab === 'overview') && (
        <div>
          {/* Key Metric Cards */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-title">Vishnupuri Dam Level</div>
              <div className="stat-card-value">{damState.waterLevel.toFixed(2)} m</div>
              <div className="stat-card-desc">FRL: {damState.frl.toFixed(2)} m (Buffer: {(damState.frl - damState.waterLevel).toFixed(2)} m)</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Live Gross Storage</div>
              <div className="stat-card-value" style={{ color: '#2563eb' }}>{damState.storagePercent}%</div>
              <div className="stat-card-desc">{damState.storageMcm} MCM of 80.79 MCM</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Catchment Inflow</div>
              <div className="stat-card-value">{damState.inflowCusecs.toLocaleString()} cusecs</div>
              <div className="stat-card-desc">Godavari Upstream Inflow</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Controlled Outflow</div>
              <div className="stat-card-value" style={{ color: '#16a34a' }}>{damState.outflowCusecs.toLocaleString()} cusecs</div>
              <div className="stat-card-desc">{damState.openGates} of {damState.totalGates} Crest Gates Open</div>
            </div>
          </div>

          {/* Dam Control & Hydraulic Status */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Crest Gate Discharge Status</h3>
                <span className="badge badge-operational">NORMAL REGULATION</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Radial gates are operated according to the Central Water Commission (CWC) Rule Curve to maintain safety margins.
              </p>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Active Gates:</span>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{damState.openGates} Radial Gates</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Gate Lift Height:</span>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{damState.gateHeightMeters} m</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Downstream Flood Mark:</span>
                    <div style={{ fontWeight: 600, color: '#16a34a' }}>Within Safe Banks</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Siren Broadcast:</span>
                    <div style={{ fontWeight: 600 }}>Operational (Last tested: 08:00 AM)</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('ai-predictions')}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Cpu size={16} />
                <span>Simulate Inflow &amp; Inundation Scenarios</span>
              </button>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Hydro-Meteorological Telemetry</h3>
                <span className="badge badge-info">10-MIN INTERVALS</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Upstream CWC Gauge (Degaon)</span>
                  <span style={{ fontWeight: 600 }}>352.85 m (Steady)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Downstream Nanded Bridge Gauge</span>
                  <span style={{ fontWeight: 600 }}>350.12 m (Warning: 354.00 m)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Dam Site Rain Gauge (24h)</span>
                  <span style={{ fontWeight: 600 }}>45.5 mm (Moderate)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Catchment Evaporation Rate</span>
                  <span style={{ fontWeight: 600 }}>4.8 mm/day</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Telemetry Network Battery</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>98% (Solar Float)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Predictions Tab */}
      {activeTab === 'ai-predictions' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Multi-Hazard AI Simulation &amp; Decision Support Desk
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Execute machine learning prediction models via NestJS backend integration. Model results provide advisory insights and can be forwarded to District Authority for alert authorization.
            </p>
          </div>

          <div className="grid-2">
            {/* Input Form Card */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
                Simulation Parameters
              </h3>

              <div className="form-group">
                <label className="form-label">Select Hazard Domain</label>
                <select
                  className="form-select"
                  value={selectedHazard}
                  onChange={(e) => {
                    setSelectedHazard(e.target.value as any);
                    setPredictionResult(null);
                    setPredictionError(null);
                  }}
                >
                  <option value="flood">Flood &amp; Dam Discharge (Vishnupuri Pilot)</option>
                  <option value="cyclone">Cyclone &amp; Storm Gale (IMD Radar Integration)</option>
                  <option value="landslide">Landslide &amp; Slope Instability</option>
                  <option value="tsunami">Tsunami &amp; Coastal Surge Dynamics</option>
                </select>
              </div>

              {selectedHazard === 'flood' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Projected Inflow Rate (cusecs)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={floodInflow}
                      onChange={(e) => setFloodInflow(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Catchment 24-Hour Rainfall (mm)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={floodRainfall}
                      onChange={(e) => setFloodRainfall(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Downstream River Safe Capacity (cusecs)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={floodDownstreamCap}
                      onChange={(e) => setFloodDownstreamCap(Number(e.target.value))}
                    />
                  </div>
                </>
              )}

              {selectedHazard === 'cyclone' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Sustained Wind Speed (km/h)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={cycloneWindSpeed}
                      onChange={(e) => setCycloneWindSpeed(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Central Atmospheric Pressure (hPa)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={cyclonePressure}
                      onChange={(e) => setCyclonePressure(Number(e.target.value))}
                    />
                  </div>
                </>
              )}

              {selectedHazard === 'landslide' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Antecedent 72h Rainfall (mm)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={landslideRainfall}
                      onChange={(e) => setLandslideRainfall(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Slope Angle (degrees)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={landslideSlope}
                      onChange={(e) => setLandslideSlope(Number(e.target.value))}
                    />
                  </div>
                </>
              )}

              {selectedHazard === 'tsunami' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Earthquake Richter Magnitude</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={tsunamiMagnitude}
                      onChange={(e) => setTsunamiMagnitude(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Focal Depth (km)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={tsunamiDepth}
                      onChange={(e) => setTsunamiDepth(Number(e.target.value))}
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleRunPrediction}
                disabled={isPredicting}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isPredicting ? (
                  <span>Computing Prediction...</span>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Run AI Predictive Simulation</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Card */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
                Model Simulation Output
              </h3>

              {predictionError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.85rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                  {predictionError}
                </div>
              )}

              {!predictionResult && !predictionError && (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                  <Cpu size={36} style={{ margin: '0 auto 0.75rem auto', color: '#cbd5e1' }} />
                  <p style={{ fontSize: '0.875rem' }}>
                    Configure the hydraulic or meteorological parameters on the left and run simulation to evaluate hazard risk.
                  </p>
                </div>
              )}

              {predictionResult && (
                <div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-operational">PREDICTION COMPUTED</span>
                      <span style={{ fontSize: '0.75rem', color: '#166534' }}>Execution: SUCCESS</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '1.1rem', color: '#166534' }}>
                      Severity: {predictionResult.severity || predictionResult.data?.severity || 'EVALUATED'}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.825rem', marginBottom: '1rem' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {JSON.stringify(predictionResult, null, 2)}
                    </pre>
                  </div>

                  {alertSubmitted ? (
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} />
                      <span>Forwarded to District Authority for Human-in-the-loop review.</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleForwardToAuthority}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Send size={16} />
                      <span>Forward as Alert Proposal to Authority (HITL)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sensors Tab */}
      {activeTab === 'sensors' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Connected Ground Sensor Registry</h3>
            <span className="badge badge-operational">ALL STATIONS HEALTHY</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sensor ID</th>
                  <th>Location</th>
                  <th>Sensor Type</th>
                  <th>Last Reading</th>
                  <th>Battery / Health</th>
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>SNR-VISH-WL-01</td>
                  <td>Vishnupuri Dam Crest</td>
                  <td>Ultrasonic Water Level</td>
                  <td>353.40 m</td>
                  <td><span className="badge badge-operational">99% (Good)</span></td>
                  <td>5 mins</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>SNR-GODV-DS-02</td>
                  <td>Nanded Bridge Downstream</td>
                  <td>Hydrostatic Pressure Gauge</td>
                  <td>350.12 m</td>
                  <td><span className="badge badge-operational">94% (Good)</span></td>
                  <td>10 mins</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>SNR-BILOLI-RG-03</td>
                  <td>Biloli Catchment Station</td>
                  <td>Tipping Bucket Rain Gauge</td>
                  <td>18.4 mm</td>
                  <td><span className="badge badge-operational">91% (Good)</span></td>
                  <td>15 mins</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Add Operational Log Entry
            </h3>
            <form onSubmit={handleAddLog}>
              <div className="form-group">
                <label className="form-label">Operator Observations / Gate Alterations</label>
                <textarea
                  required
                  rows={4}
                  className="form-textarea"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Record gate changes, siren warnings, water turbidity, or inspection notes..."
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <FileCheck2 size={16} />
                <span>Save to Official Station Log</span>
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Today's Station Log History
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
              {logList.map((log) => (
                <div key={log.id} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ fontWeight: 600 }}>{log.operator}</span>
                    <span>{log.time}</span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#1e293b' }}>
                    {log.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
