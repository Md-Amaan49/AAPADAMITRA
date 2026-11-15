import React, { useState } from 'react';
import { DashboardLayout } from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Gauge, 
  Radio, 
  Clock 
} from 'lucide-react';

interface AlertItem {
  id: string;
  hazard: string;
  source: string;
  severity: 'WARNING' | 'CRITICAL' | 'OPERATIONAL';
  targetArea: string;
  summary: string;
  status: 'PENDING_APPROVAL' | 'BROADCASTED' | 'REJECTED';
  timestamp: string;
  scientificConfidence: string;
}

export const AuthorityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Human-in-the-loop pending alert proposals
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'ALT-2026-081',
      hazard: 'Flood & Dam Inundation',
      source: 'AI Predictive Model (Vishnupuri Inflow Surge)',
      severity: 'WARNING',
      targetArea: 'Godavari Basin — Downstream Villages (Degaon, Sangvi, Vishnupuri)',
      summary: 'Upstream catchment inflow projected to reach 45,000 cusecs within 6 hours. Barrage gate clearance recommended.',
      status: 'PENDING_APPROVAL',
      timestamp: 'Today, 10:45 AM IST',
      scientificConfidence: '88.4% (R-2 High Hydro Correlation)',
    },
    {
      id: 'ALT-2026-082',
      hazard: 'Tropical Cyclone & Storm Gale',
      source: 'AI Coastal Model (IMD Radar Feeds)',
      severity: 'OPERATIONAL',
      targetArea: 'Regional Buffer Area (East Maharashtra corridor)',
      summary: 'Depression sustained wind speed 48 km/h. Advisory bulletin for agricultural storage.',
      status: 'PENDING_APPROVAL',
      timestamp: 'Today, 09:15 AM IST',
      scientificConfidence: '91.2% (Ensemble Model v2.1)',
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleApproveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'BROADCASTED' as const } : a))
    );
    setNotification(`Alert ${id} has been formally authorized and broadcast to emergency channels.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRejectAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED' as const } : a))
    );
    setNotification(`Alert ${id} was rejected and archived to audit log.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <DashboardLayout
      title="District Disaster Management Command"
      subtitle={`Welcome, ${user?.fullName || 'Collector & District Magistrate'} (DDMA Nanded)`}
      currentTab={activeTab}
      onTabChange={setActiveTab}
    >
      {notification && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Overview Tab */}
      {(!activeTab || activeTab === 'overview') && (
        <div>
          {/* Top KPI Grid */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-title">DEOC Alert State</div>
              <div className="stat-card-value" style={{ color: '#2563eb' }}>LEVEL-1</div>
              <div className="stat-card-desc">Enhanced Vigilance (Monsoon Preparedness)</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Vishnupuri Dam Level</div>
              <div className="stat-card-value">353.40 m</div>
              <div className="stat-card-desc">FRL: 355.00 m &bull; Storage: 78.4%</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Pending Authorizations</div>
              <div className="stat-card-value" style={{ color: '#d97706' }}>
                {alerts.filter((a) => a.status === 'PENDING_APPROVAL').length}
              </div>
              <div className="stat-card-desc">Human-in-the-loop review required</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Field Response Units</div>
              <div className="stat-card-value" style={{ color: '#16a34a' }}>8 Units</div>
              <div className="stat-card-desc">SDRF, Police &amp; Irrigation Crews On-Call</div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#f8fafc' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Human-in-the-Loop Safeguard Notice</h3>
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                All predictive simulations require validation by the District Authority before public SMS or siren broadcast.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <AlertTriangle size={16} />
              <span>Review Pending Alerts ({alerts.filter((a) => a.status === 'PENDING_APPROVAL').length})</span>
            </button>
          </div>

          {/* Active Disseminated Bulletins Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Disaster Bulletins &amp; Public Notices</h3>
              <span className="badge badge-operational">OFFICIAL DIRECTIVES</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Alert ID</th>
                    <th>Hazard</th>
                    <th>Severity</th>
                    <th>Target Area</th>
                    <th>Dissemination Status</th>
                    <th>Confidence</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td style={{ fontWeight: 600 }}>{alert.id}</td>
                      <td>{alert.hazard}</td>
                      <td>
                        <span className={`badge ${alert.severity === 'CRITICAL' ? 'badge-critical' : alert.severity === 'WARNING' ? 'badge-warning' : 'badge-info'}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td>{alert.targetArea}</td>
                      <td>
                        {alert.status === 'BROADCASTED' && (
                          <span className="badge badge-operational">
                            <CheckCircle2 size={12} /> BROADCASTED
                          </span>
                        )}
                        {alert.status === 'PENDING_APPROVAL' && (
                          <span className="badge badge-warning">
                            <Clock size={12} /> PENDING REVIEW
                          </span>
                        )}
                        {alert.status === 'REJECTED' && (
                          <span className="badge badge-critical">
                            <XCircle size={12} /> REJECTED
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{alert.scientificConfidence}</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{alert.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Alert Approvals Tab (Human In The Loop) */}
      {activeTab === 'alerts' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Human-in-the-Loop Alert Authorization Desk
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Review machine-generated risk models and sensor threshold breaches before public issuance under the Disaster Management Act.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {alerts.filter((a) => a.status === 'PENDING_APPROVAL').length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534' }}>All Pending Drafts Cleared</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  There are currently no unreviewed AI predictions or alert drafts awaiting authorization.
                </p>
              </div>
            ) : (
              alerts
                .filter((a) => a.status === 'PENDING_APPROVAL')
                .map((item) => (
                  <div key={item.id} className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-warning">{item.severity}</span>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.hazard}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({item.id})</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Source: <strong>{item.source}</strong> &bull; Submitted: {item.timestamp}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                        <span style={{ color: '#64748b' }}>Model Confidence:</span>
                        <div style={{ fontWeight: 700, color: '#1d4ed8' }}>{item.scientificConfidence}</div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>TARGETED JURISDICTION</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>{item.targetArea}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>SITUATION SUMMARY &amp; ADVISORY</div>
                      <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                        {item.summary}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleRejectAlert(item.id)}
                        className="btn-secondary"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        <XCircle size={16} />
                        <span>Reject &amp; Archive</span>
                      </button>
                      <button
                        onClick={() => handleApproveAlert(item.id)}
                        className="btn-primary"
                      >
                        <CheckCircle2 size={16} />
                        <span>Authorize &amp; Issue Public Alert</span>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Critical Infrastructure Tab */}
      {activeTab === 'infrastructure' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Critical Infrastructure &amp; Dam Assets
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Monitoring focal hydraulic assets and regional hydrological monitoring stations.
            </p>
          </div>

          <div className="grid-2">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Gauge size={22} color="#1d4ed8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Shankarrao Chavan Vishnupuri Barrage</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Basin &amp; River</span>
                  <span style={{ fontWeight: 600 }}>Godavari River, Nanded</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Full Reservoir Level (FRL)</span>
                  <span style={{ fontWeight: 600 }}>355.00 m</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Current Water Level</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>353.40 m (Normal)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Storage Capacity</span>
                  <span style={{ fontWeight: 600 }}>80.79 MCM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Crest Gates</span>
                  <span style={{ fontWeight: 600 }}>18 Gates (Radial Type)</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Radio size={22} color="#0891b2" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Active Telemetry Stations</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Nanded Bridge Gauge (CWC)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Water Level: 350.12 m</div>
                  </div>
                  <span className="badge badge-operational">ONLINE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Vishnupuri Barrage Inflow Station</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Inflow: 4,200 cusecs</div>
                  </div>
                  <span className="badge badge-operational">ONLINE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Mudkhed Automatic Weather Station</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rainfall: 14.2 mm (24h)</div>
                  </div>
                  <span className="badge badge-operational">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Registered Personnel &amp; Role Directory</h3>
            <span className="badge badge-info">RBAC ENFORCED</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Designation / Name</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Department / Jurisdiction</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>District Collector &amp; DM</td>
                  <td>admin@aapadamitra.gov.in</td>
                  <td><span className="badge badge-critical">DISTRICT_AUTHORITY</span></td>
                  <td>DDMA Nanded Collectorate</td>
                  <td><span className="badge badge-operational">ACTIVE</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Chief Dam Control Officer</td>
                  <td>operator@aapadamitra.gov.in</td>
                  <td><span className="badge badge-warning">MONITORING_OPERATOR</span></td>
                  <td>Vishnupuri Barrage Site Office</td>
                  <td><span className="badge badge-operational">ACTIVE</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>SDRF Field Operations Leader</td>
                  <td>responder@aapadamitra.gov.in</td>
                  <td><span className="badge badge-info">EMERGENCY_RESPONDER</span></td>
                  <td>State Disaster Response Force</td>
                  <td><span className="badge badge-operational">ACTIVE</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Registered Citizens (Public)</td>
                  <td>citizen@aapadamitra.gov.in</td>
                  <td><span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>CITIZEN</span></td>
                  <td>Nanded Municipal Corporation</td>
                  <td><span className="badge badge-operational">ACTIVE</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Statutory Audit Trail &amp; System Log</h3>
            <span className="badge badge-operational">TAMPER-EVIDENT</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem' }}>
                <span>EVENT ID: #LOG-8812</span>
                <span>Today, 11:30 AM IST</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>User Authentication: admin@aapadamitra.gov.in logged in from secure terminal</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Role: DISTRICT_AUTHORITY &bull; Session initialized with JWT Bearer Token</div>
            </div>
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem' }}>
                <span>EVENT ID: #LOG-8811</span>
                <span>Today, 10:45 AM IST</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>AI Model Prediction Triggered: Flood Inundation Severity (Vishnupuri Dam)</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Output Severity: HIGH &bull; Governance status: PENDING_AUTHORITY_APPROVAL</div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
