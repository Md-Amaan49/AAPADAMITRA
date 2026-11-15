import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to process reset request.');
      }

      setSubmitted(true);
      if (data.resetToken) {
        setDemoToken(data.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit reset request.');
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
            <KeyRound size={28} />
          </div>
          <h1>Password Recovery</h1>
          <p>Reset your official platform password</p>
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

        {submitted ? (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={40} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>Instructions Sent</h3>
            <p style={{ color: '#14532d', fontSize: '0.85rem', lineHeight: 1.5 }}>
              If an account with {email} exists in the directory, password reset instructions have been dispatched.
            </p>
            {demoToken && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#ffffff', border: '1px dashed #86efac', borderRadius: '6px', textAlign: 'left', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#166534' }}>Development Reset Link:</span>
                <div style={{ marginTop: '0.25rem', wordBreak: 'break-all' }}>
                  <Link to={`/reset-password?token=${demoToken}`} style={{ color: '#1d4ed8', textDecoration: 'underline' }}>
                    Click here to proceed to Reset Form
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Account Email Address</label>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              <span>{isSubmitting ? 'Sending Request...' : 'Send Recovery Link'}</span>
              <Send size={16} />
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: '#64748b', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

