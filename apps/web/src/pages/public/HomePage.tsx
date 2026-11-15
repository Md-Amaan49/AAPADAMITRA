import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Users, 
  ArrowRight, 
  Waves, 
  Cpu 
} from 'lucide-react';
import { fetchApiHealth, fetchAiHealth } from '../../services/apiClient';

export const HomePage: React.FC = () => {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetchApiHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));

    fetchAiHealth()
      .then(() => setAiOnline(true))
      .catch(() => setAiOnline(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-tag">
            <ShieldAlert size={14} />
            <span>GOVERNMENT OF MAHARASHTRA &bull; DEOC NANDED PILOT</span>
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

      {/* Main Container */}
      <div className="page-container">
        {/* Real-time Infrastructure & Pilot Overview */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-title">Pilot Focal Asset</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem' }}>Vishnupuri Dam</div>
            <div className="stat-card-desc">Godavari Basin, Nanded District (Storage: 80.79 MCM)</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Backend Gateway Status</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem', color: apiOnline === true ? '#16a34a' : apiOnline === false ? '#dc2626' : '#d97706' }}>
              {apiOnline === true ? 'ONLINE (v1)' : apiOnline === false ? 'OFFLINE' : 'CHECKING...'}
            </div>
            <div className="stat-card-desc">NestJS High-Availability Architecture</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">AI Simulation Engine</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem', color: aiOnline === true ? '#16a34a' : aiOnline === false ? '#dc2626' : '#d97706' }}>
              {aiOnline === true ? 'OPERATIONAL' : aiOnline === false ? 'DEGRADED' : 'CHECKING...'}
            </div>
            <div className="stat-card-desc">Multi-Hazard Hosted ML Services</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Statutory Safeguard</div>
            <div className="stat-card-value" style={{ fontSize: '1.25rem', color: '#2563eb' }}>HITL Enforced</div>
            <div className="stat-card-desc">Zero Autonomous Public Warnings</div>
          </div>
        </div>

        {/* Core Pillars */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            Integrated Disaster Management Architecture
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

        {/* How It Works - Step-by-Step Flow */}
        <div className="card" style={{ padding: '2.5rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.75rem', color: 'var(--primary-navy)' }}>
            Operational Emergency Workflow
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.5rem' }}>STAGE 01 &bull; SENSING</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Telemetry Ingestion</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                Dam water levels, rain gauge readings, and seismic inputs are ingested continuously by monitoring operators.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.5rem' }}>STAGE 02 &bull; ANALYSIS</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Decision Support</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                Machine learning models compute inundation scenarios and severity scores with scientific caveats attached.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.5rem' }}>STAGE 03 &bull; APPROVAL</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Authority Verification</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                District Authority reviews predictions, verifies ground reality, and authorizes official alerts.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.5rem' }}>STAGE 04 &bull; DISPATCH</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Response &amp; Safety</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                Emergency response units are dispatched to vulnerable zones while citizens receive verified safety advisories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
