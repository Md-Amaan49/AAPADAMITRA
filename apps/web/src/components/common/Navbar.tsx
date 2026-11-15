import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDistrict } from '../../context/DistrictContext';
import { 
  ShieldAlert, 
  PhoneCall, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X,
  AlertTriangle,
  MapPin
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentDistrict, setDistrict, availableDistricts } = useDistrict();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);

  const getDashboardPath = (role?: string) => {
    switch (role) {
      case 'DISTRICT_AUTHORITY':
      case 'ADMIN':
        return '/dashboard/authority';
      case 'MONITORING_OPERATOR':
      case 'CONTROL_ROOM_OPERATOR':
        return '/dashboard/operator';
      case 'EMERGENCY_RESPONDER':
      case 'FIELD_RESPONDER':
        return '/dashboard/responder';
      case 'CITIZEN':
      default:
        return '/dashboard/citizen';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      {/* Official Government Emergency Ticker */}
      <div className="emergency-ticker">
        <div className="emergency-ticker-content">
          <AlertTriangle size={14} />
          <span>OFFICIAL DISASTER MANAGEMENT PORTAL — JURISDICTION: {currentDistrict.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
          <span><PhoneCall size={12} style={{ display: 'inline', marginRight: '4px' }} />National: <strong>112</strong></span>
          <span>Disaster: <strong>1070</strong></span>
          <span>{currentDistrict === 'Mumbai' ? 'BMC Disaster Desk: 022-22694725' : 'DEOC Desk: 02462-235077'}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="public-nav">
        <div className="public-nav-container">
          <Link to="/" className="brand-badge">
            <div style={{
              background: 'linear-gradient(135deg, #1d4ed8, #0a192f)',
              color: '#ffffff',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <span className="brand-title">AAPADAMITRA</span>
              <span className="brand-subtitle">Multi-Hazard Emergency Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Overview
            </Link>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
              About Pilot
            </Link>
            <Link to="/hazards" className={`nav-link ${location.pathname === '/hazards' ? 'active' : ''}`}>
              Hazard Monitoring
            </Link>
            <Link to="/preparedness" className={`nav-link ${location.pathname === '/preparedness' ? 'active' : ''}`}>
              Safety Protocols
            </Link>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
              Helplines
            </Link>
          </div>

          {/* District Location Selector Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '0.35rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#1e293b',
                cursor: 'pointer'
              }}
              title="Click to switch your monitored jurisdiction"
            >
              <MapPin size={13} color="#dc2626" />
              <span>{currentDistrict}</span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>▼</span>
            </button>

            {districtDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 100,
                minWidth: '190px',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '0.35rem 0.5rem' }}>
                  Select Jurisdiction
                </div>
                {availableDistricts.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDistrict(d);
                      setDistrictDropdownOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: d === currentDistrict ? 700 : 500,
                      background: d === currentDistrict ? '#eff6ff' : 'none',
                      color: d === currentDistrict ? '#1d4ed8' : '#334155',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {d} {d === currentDistrict && '✓'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to={getDashboardPath(user.role)} className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
                  <User size={14} color="#64748b" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{user.fullName.split(' ')[0]}</span>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="btn-secondary" 
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login" className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
                  Citizen Registration
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#334155'
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="nav-link">Overview</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="nav-link">About Pilot</Link>
              <Link to="/hazards" onClick={() => setMobileMenuOpen(false)} className="nav-link">Hazard Monitoring</Link>
              <Link to="/preparedness" onClick={() => setMobileMenuOpen(false)} className="nav-link">Safety Protocols</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="nav-link">Helplines</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

