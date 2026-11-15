import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, PhoneCall, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="public-footer">
      <div className="footer-container">
        {/* Column 1: Platform Overview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <ShieldAlert size={22} color="#3b82f6" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>AAPADAMITRA</span>
          </div>
          <p style={{ fontSize: '0.825rem', lineHeight: 1.6, color: '#94a3b8' }}>
            Multi-Hazard Disaster Management &amp; Early Warning Coordination Platform. Designed for inter-agency coordination between District Authorities, Dam Control Rooms, Emergency Responders and Citizens.
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
            Pilot Deployment: Vishnupuri Dam Reservoir &amp; Godavari Basin, Nanded District, Maharashtra.
          </div>
        </div>

        {/* Column 2: Emergency Helplines */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Emergency Toll-Free Helplines
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneCall size={14} color="#f87171" />
              <span>National Unified Emergency: <strong>112</strong></span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneCall size={14} color="#f87171" />
              <span>Disaster Helpline (SDMA): <strong>1070</strong></span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneCall size={14} color="#f87171" />
              <span>District Control (DEOC): <strong>1077</strong></span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneCall size={14} color="#f87171" />
              <span>Medical Emergency (Ambulance): <strong>108</strong></span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneCall size={14} color="#f87171" />
              <span>Nanded District DEOC Desk: <strong>02462-235077</strong></span>
            </li>
          </ul>
        </div>

        {/* Column 3: Navigation & Statutory References */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Important Resources
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <li>
              <Link to="/hazards" style={{ color: '#cbd5e1' }}>Multi-Hazard Monitoring Registry</Link>
            </li>
            <li>
              <Link to="/preparedness" style={{ color: '#cbd5e1' }}>NDMA / SDMA Safety Protocols</Link>
            </li>
            <li>
              <Link to="/about" style={{ color: '#cbd5e1' }}>Vishnupuri Dam Operational Architecture</Link>
            </li>
            <li>
              <Link to="/contact" style={{ color: '#cbd5e1' }}>District Collectorate &amp; Control Rooms</Link>
            </li>
            <li>
              <a 
                href="https://ndma.gov.in" 
                target="_blank" 
                rel="noreferrer" 
                style={{ color: '#93c5fd', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                NDMA India <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Regulatory & Statutory Boundary */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Statutory Notice
          </h4>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderLeft: '3px solid #3b82f6',
            padding: '0.75rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            color: '#cbd5e1'
          }}>
            <p>
              Under the Disaster Management Act, 2005, public warnings are issued solely through authorized District Administration channels.
            </p>
            <p style={{ marginTop: '0.5rem', color: '#94a3b8' }}>
              Automated AI simulations serve strictly as decision support for monitoring operators and are never published to citizens without human authorization.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          AAPADAMITRA Emergency Coordination Portal &bull; Developed in compliance with Government Disaster Management Guidelines &bull; Version 1.0.0
        </p>
      </div>
    </footer>
  );
};
