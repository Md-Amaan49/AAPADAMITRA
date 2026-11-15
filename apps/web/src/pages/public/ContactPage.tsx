import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Building2, 
  Send, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'INQUIRY',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
          <PhoneCall size={16} />
          <span>Emergency Coordination Directories</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>
          District Emergency Control Rooms &amp; Helplines
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '850px', marginTop: '0.5rem' }}>
          Direct hotlines to the District Emergency Operations Centre (DEOC), Vishnupuri Barrage Site Desk, and statutory disaster response agencies.
        </p>
      </div>

      {/* Emergency Notice */}
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        marginBottom: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <AlertTriangle size={20} color="#dc2626" />
        <div style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 600 }}>
          FOR IMMEDIATE LIFE-THREATENING EMERGENCIES, DIAL 112 OR 1077 DIRECTLY. DO NOT USE ONLINE FORMS FOR ACTIVE SEARCH &amp; RESCUE CALLS.
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Official Directories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={20} color="#1d4ed8" />
              <span>District Disaster Management Authority (DDMA), Nanded</span>
            </h3>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>District Collectorate Office, Station Road, Nanded - 431601, Maharashtra, India</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <PhoneCall size={18} color="#16a34a" />
                <span>Control Room (DEOC Desk): <strong>02462-235077 / 1077</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mail size={18} color="#2563eb" />
                <span>collector.nanded@maharashtra.gov.in</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={20} color="#0891b2" />
              <span>Vishnupuri Barrage Site Office &amp; Irrigation Division</span>
            </h3>
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Nanded Irrigation Division, Shankarrao Chavan Vishnupuri Project Site, Nanded</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <PhoneCall size={18} color="#16a34a" />
                <span>Dam Control Room Hotline: <strong>02462-229124</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: General Non-Emergency Query Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Non-Emergency Administrative Inquiry
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.825rem', marginBottom: '1.5rem' }}>
            Submit general queries regarding disaster preparedness materials, volunteer registration, or platform feedback.
          </p>

          {submitted ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>Inquiry Submitted</h4>
              <p style={{ color: '#14532d', fontSize: '0.85rem' }}>
                Your message has been logged with reference ID #AAP-{Math.floor(100000 + Math.random() * 900000)}. The DEOC administrative desk will review during standard office hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patil"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    pattern="^[6-9]\d{9}$"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message Details</label>
                <textarea
                  required
                  rows={4}
                  className="form-textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry..."
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Send size={16} />
                <span>Submit Non-Emergency Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

