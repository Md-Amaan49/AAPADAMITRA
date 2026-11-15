import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <Compass size={36} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          404 — Page Not Found
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          The disaster management resource or endpoint you requested is not recognized.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/" className="btn-primary">
            <Home size={16} />
            <span>Return to Safety Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

