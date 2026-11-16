import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  ArrowRight,
  Waves,
  Cpu,
  MapPin
} from 'lucide-react';
import { fetchApiHealth, fetchAiHealth, fetchActiveAlerts } from '../../services/apiClient';
import { useDistrict } from '../../context/DistrictContext';
import { AlertCountdown } from '../../components/alerts/AlertCountdown';

export const HomePage: React.FC = () => {
  const { currentDistrict } = useDistrict();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  useEffect(() => {
    fetchApiHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));

    fetchAiHealth()
      .then(() => setAiOnline(true))
      .catch(() => setAiOnline(false));
  }, []);

  useEffect(() => {
    setAlertsLoading(true);
    fetchActiveAlerts(currentDistrict)
      .then((data) => setActiveAlerts(data))
      .catch(() => setActiveAlerts([]))
      .finally(() => setAlertsLoading(false));
  }, [currentDistrict]);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-tag">
            <ShieldAlert size={14} />
            <span>DISASTER MANAGEMENT &bull; JURISDICTION: {currentDistrict.toUpperCase()}</span>
          </div>
          <h1 className="hero-title">
            Unified Multi-Hazard Early Warning &amp; Emergency Coordination
          </h1>
          <p className="hero-lead">
            Connecting District Authorities, Dam Control Rooms, Emergency Response Teams, and Citizens for real-time situational awareness and rapid disaster response.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
              <span>Citizen Portal Sign Up</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem', background: 'transparent', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
              <span>Official Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-Time Active Disaster Alert Banner with Countdown (Filtered by District) */}
      <div style={{ background: '#0a192f', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: activeAlerts.length > 0 ? '0.75rem' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontSize: '0.85rem', fontWeight: 700 }}>
              <MapPin size={16} color="#f87171" />
              <span>LIVE HAZARD RADAR &bull; SHOWING FOR: {currentDistrict.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Switch district in top navbar to view alerts for other Maharashtra jurisdictions.
            </div>
          </div>

          {alertsLoading ? (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Syncing telemetry and active advisories...</div>
          ) : activeAlerts.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#86efac', fontSize: '0.825rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              <span>No active critical disaster warnings in <strong>{currentDistrict}</strong>. Standard meteorological watch in effect.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: alert.severity === 'CRITICAL_EVACUATION' || alert.severity === 'WARNING'
                      ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(15, 23, 42, 0.9))'
                      : 'linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(15, 23, 42, 0.9))',
                    border: alert.severity === 'CRITICAL_EVACUATION' || alert.severity === 'WARNING'
                      ? '1px solid #ef4444'
                      : '1px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    color: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span className={`badge ${alert.severity === 'CRITICAL_EVACUATION' || alert.severity === 'WARNING' ? 'badge-critical' : 'badge-warning'}`}>
                        {alert.severity.replace(/_/g, ' ')}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                        {alert.title}
                      </h4>
                    </div>

                    {/* Live Ticking Countdown Timer */}
                    <AlertCountdown
                      onsetAt={alert.onsetAt}
                      expiresAt={alert.expiresAt}
                      createdAt={alert.createdAt}
                    />
                  </div>

                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {alert.summary}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    <span>Target Areas: <strong>{alert.affectedAreas.join(', ')}</strong></span>
                    <span>Source: <strong>{alert.sourceDetails}</strong></span>
                    {alert.approvedBy && <span>Authorized By: <strong>{alert.approvedBy}</strong></span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="page-container">
        {/* Real-time Infrastructure & Pilot Overview */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-title">Active Jurisdiction</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem', color: '#1d4ed8' }}>{currentDistrict}</div>
            <div className="stat-card-desc">{currentDistrict === 'Nanded' ? 'Vishnupuri Dam Basin (Pilot)' : currentDistrict === 'Mumbai' ? 'Coastal & Urban Flood Zone' : 'Maharashtra State DDMA Grid'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Backend Gateway Status</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem', color: apiOnline === true ? '#16a34a' : apiOnline === false ? '#dc2626' : '#d97706' }}>
              {apiOnline === true ? 'ONLINE (v1)' : apiOnline === false ? 'OFFLINE' : 'CHECKING...'}
            </div>
            <div className="stat-card-desc">High-Availability API Core</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">AI Simulation Engine</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem', color: aiOnline === true ? '#16a34a' : aiOnline === false ? '#dc2626' : '#d97706' }}>
              {aiOnline === true ? 'OPERATIONAL' : aiOnline === false ? 'DEGRADED' : 'CHECKING...'}
            </div>
            <div className="stat-card-desc">5 Connected Multi-Hazard Services</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Statutory Safeguard</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem', color: '#2563eb' }}>HITL Enforced</div>
            <div className="stat-card-desc">Zero Autonomous Public Panics</div>
          </div>
        </div>

        {/* Core Pillars */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            Integrated Multi-Hazard Disaster Architecture
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0.5rem auto 0 auto', fontSize: '0.95rem' }}>
            Built around the four statutory phases of disaster management: Prevention, Preparedness, Response, and Recovery.
          </p>
        </div>

        <div className="grid-3" style={{ marginBottom: '3.5rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#eff6ff', color: '#1d4ed8', width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Waves size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Dam &amp; Flood Early Warning</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Continuous reservoir level tracking, gate discharge monitoring, and upstream rainfall inflow correlation for the Godavari river basin around Vishnupuri Dam.
            </p>
            <Link to="/hazards" style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: 'auto' }}>
              <span>Explore Hazard Scope</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#fef3c7', color: '#b45309', width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Predictive Simulations</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Automated and operator-triggered machine learning models covering flood inundation, cyclone wind radii, landslide susceptibility, and tsunami travel time.
            </p>
            <Link to="/about" style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: 'auto' }}>
              <span>Learn About Governance</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f0fdf4', color: '#15803d', width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Inter-Agency Coordination</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Role-based operational dashboards for District Authorities, Control Room Operators, Emergency Responders (SDRF/NDRF/Police), and Registered Citizens.
            </p>
            <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: 'auto' }}>
              <span>Access Role Dashboards</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
