import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, Home } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fef3c7',
          color: '#d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <Lock size={36} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          403 — Action Forbidden
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          This operation requires higher authority elevation or human-in-the-loop validation according to protocol.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Link to="/" className="btn-secondary">
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
          <Link to="/login" className="btn-primary">
            <ArrowLeft size={16} />
            <span>Sign In with Authority</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
