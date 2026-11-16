import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  ExternalLink, 
  Clock 
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  currentTab,
  onTabChange
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar currentTab={currentTab} onTabChange={onTabChange} />

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top bar */}
        <header className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Toggle sidebar"
            >
              {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* System Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
              <span style={{ color: '#166534' }}>DEOC LINK: OPERATIONAL</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Clock size={14} />
              <span>IST (UTC+5:30)</span>
            </div>

            <Link
              to="/"
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <span>Public Portal</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </header>

        {/* Inner Content */}
        <div className="dashboard-content">
          {/* Statutory Governance Alert Banner */}
          <div className="statutory-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <ShieldCheck size={16} />
              <span>STATUTORY COMPLIANCE &amp; HUMAN-IN-THE-LOOP SAFEGUARD</span>
            </div>
            <div>
              All warning disseminations are governed by the Disaster Management Act, 2005. Predictive AI simulations serve strictly as decision support and cannot issue autonomous public alerts without designated authority approval.
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
