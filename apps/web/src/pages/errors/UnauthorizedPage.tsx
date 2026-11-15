import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <ShieldX size={36} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Access Restricted
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          You do not have the required statutory role or operational clearance to access this module.
        </p>

        {user && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.825rem'
          }}>
            <div>Current Authenticated Role: <strong>{user.role}</strong></div>
            <div style={{ color: '#64748b', marginTop: '0.25rem' }}>Account: {user.email}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Link to="/" className="btn-secondary">
            <Home size={16} />
            <span>Public Home</span>
          </Link>
          <Link to="/login" className="btn-primary">
            <ArrowLeft size={16} />
            <span>Switch Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

