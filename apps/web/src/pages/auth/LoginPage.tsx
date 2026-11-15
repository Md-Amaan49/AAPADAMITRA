import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse redirect query param if present
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  const redirectByRole = (role: string) => {
    if (redirectUrl) {
      navigate(redirectUrl);
      return;
    }
    switch (role) {
      case 'DISTRICT_AUTHORITY':
      case 'ADMIN':
        navigate('/dashboard/authority');
        break;
      case 'MONITORING_OPERATOR':
      case 'CONTROL_ROOM_OPERATOR':
        navigate('/dashboard/operator');
        break;
      case 'EMERGENCY_RESPONDER':
      case 'FIELD_RESPONDER':
        navigate('/dashboard/responder');
        break;
      case 'CITIZEN':
      default:
        navigate('/dashboard/citizen');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password, rememberMe);
      redirectByRole(res.user.role);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(quickEmail, quickPass, rememberMe);
      redirectByRole(res.user.role);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8, #0a192f)',
            color: '#ffffff',
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h1>Platform Sign In</h1>
          <p>Access the AAPADAMITRA Disaster Coordination Network</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Official / Registered Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.gov.in"
              />
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" style={{ color: '#475569', cursor: 'pointer' }}>
              Keep me signed in for 7 days
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
          Are you a citizen without an account?{' '}
          <Link to="/register" style={{ color: '#1d4ed8', fontWeight: 600 }}>
            Register as Citizen
          </Link>
        </div>

        {/* Development Evaluator Quick Roles */}
        <div className="demo-creds-box">
          <h4>Test &amp; Evaluator Quick Access (Pre-seeded Accounts)</h4>
          <div className="demo-btn-grid">
            <button
              type="button"
              className="demo-quick-btn"
              onClick={() => handleQuickLogin('admin@aapadamitra.gov.in', 'AuthorityPass123!')}
            >
              1. District Authority
            </button>
            <button
              type="button"
              className="demo-quick-btn"
              onClick={() => handleQuickLogin('operator@aapadamitra.gov.in', 'OperatorPass123!')}
            >
              2. Dam Operator
            </button>
            <button
              type="button"
              className="demo-quick-btn"
              onClick={() => handleQuickLogin('responder@aapadamitra.gov.in', 'ResponderPass123!')}
            >
              3. Field Responder
            </button>
            <button
              type="button"
              className="demo-quick-btn"
              onClick={() => handleQuickLogin('citizen@aapadamitra.gov.in', 'CitizenPass123!')}
            >
              4. Citizen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
