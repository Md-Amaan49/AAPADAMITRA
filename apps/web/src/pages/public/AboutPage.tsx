import React from 'react';
import { ShieldCheck, Info, MapPin, Award, CheckCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="page-container">
      {/* Page Title */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
          <Info size={16} />
          <span>Institutional Architecture</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>
          About the AAPADAMITRA Platform
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '800px', marginTop: '0.5rem' }}>
          An integrated Multi-Hazard Disaster Management &amp; Early Warning Coordination Platform built in compliance with NDMA protocols and Maharashtra State Disaster Management guidelines.
        </p>
      </div>

      {/* Grid: Mission and Pilot */}
      <div className="grid-2" style={{ marginBottom: '3rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Award size={24} color="#1d4ed8" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Project Mission</h2>
          </div>
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            AAPADAMITRA bridges the critical communication and situational gap between field monitoring stations, mathematical and AI prediction models, district decision-makers, emergency rescue units, and the general public.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span><strong>Zero Autonomous Panic:</strong> Ensures all public notifications are vetted by authorized authorities.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span><strong>Sub-Minute Coordination:</strong> Connects Control Room Operators and Field Responders in real-time.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span><strong>Extensible Multi-Hazard Architecture:</strong> Generic schema supporting flood, cyclone, landslide, and tsunami across any Indian district.</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <MapPin size={24} color="#dc2626" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Validation Pilot: Vishnupuri Dam</h2>
          </div>
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            The initial operational validation pilot is situated in Nanded District, Maharashtra, focusing on the Shankarrao Chavan Vishnupuri Project across the Godavari River.
          </p>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>River Basin</span>
                <div style={{ fontWeight: 600 }}>Godavari River</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Gross Storage Capacity</span>
                <div style={{ fontWeight: 600 }}>80.79 MCM</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Full Reservoir Level (FRL)</span>
                <div style={{ fontWeight: 600 }}>355.00 m</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Control Desk</span>
                <div style={{ fontWeight: 600 }}>DEOC Nanded Collectorate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Governance Card */}
      <div className="card" style={{ borderLeft: '4px solid #1d4ed8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <ShieldCheck size={24} color="#1d4ed8" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Statutory Governance &amp; Ethical Guardrails</h2>
        </div>
        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
          In accordance with the <strong>Disaster Management Act, 2005</strong>, the issuance of warning directives, evacuation instructions, and disaster declarations is the statutory prerogative of the District Magistrate / District Collector, acting as the Chairman of the District Disaster Management Authority (DDMA).
        </p>
        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
          AAPADAMITRA incorporates deliberate human-in-the-loop review mechanisms. Predictive AI simulations compute risk envelopes, but cannot push public notifications to citizens or media without manual review and electronic sign-off by a designated District Authority or Control Room Supervisor.
        </p>
      </div>
    </div>
  );
};
