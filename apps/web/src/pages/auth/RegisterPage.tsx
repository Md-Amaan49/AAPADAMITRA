import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, User, Mail, Phone, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerCitizen } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the terms of statutory communication and data protection.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerCitizen({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        termsAccepted: formData.termsAccepted,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Citizen registration failed. Please try again.');
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
            <ShieldAlert size={28} />
          </div>
          <h1>Citizen Registration</h1>
          <p>Register to receive verified alerts and report local incidents</p>
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

        {success ? (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '1.75rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={42} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>Registration Successful!</h3>
            <p style={{ color: '#14532d', fontSize: '0.875rem' }}>
              Your citizen account has been established. Redirecting to platform login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Legal Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Patil"
                />
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    pattern="^[6-9]\d{9}$"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile"
                  />
                  <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 8 characters"
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-type password"
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', fontSize: '0.8rem', color: '#475569' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  required
                  style={{ marginTop: '3px' }}
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                />
                <span>
                  I consent to receive official emergency safety alerts and confirm all information provided is accurate under the Disaster Management Act.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              <span>{isSubmitting ? 'Registering...' : 'Create Citizen Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

