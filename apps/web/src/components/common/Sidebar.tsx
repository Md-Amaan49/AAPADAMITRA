import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  FileCheck2,
  Users,
  Activity,
  Gauge,
  Cpu,
  Truck,
  CheckCircle,
  Megaphone,
  LifeBuoy,
  Home,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'CITIZEN';

  const renderNavLinks = () => {
    if (role === 'DISTRICT_AUTHORITY' || role === 'ADMIN') {
      return (
        <>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, padding: '0.5rem 0.85rem' }}>
            Authority Command
          </div>
          <button
            onClick={() => onTabChange && onTabChange('overview')}
            className={`sidebar-link ${!currentTab || currentTab === 'overview' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Activity size={18} />
            <span>Situational Overview</span>
          </button>
          <button
            onClick={() => onTabChange && onTabChange('alerts')}
            className={`sidebar-link ${currentTab === 'alerts' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <AlertTriangle size={18} />
            <span>Alert Approvals (HITL)</span>
          </button>
          <button
            onClick={() => onTabChange && onTabChange('citizen-reports')}
            className={`sidebar-link ${currentTab === 'citizen-reports' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Radio size={18} />
            <span>Citizen Incident Reports</span>
          </button>
          <button
            onClick={() => onTabChange && onTabChange('infrastructure')}
            className={`sidebar-link ${currentTab === 'infrastructure' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Gauge size={18} />
            <span>Critical Infrastructure</span>
          </button>
          <button
            onClick={() => onTabChange && onTabChange('users')}
            className={`sidebar-link ${currentTab === 'users' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Users size={18} />
            <span>Personnel &amp; Roles</span>
          </button>
          <button
            onClick={() => onTabChange && onTabChange('audit')}
            className={`sidebar-link ${currentTab === 'audit' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <FileCheck2 size={18} />
            <span>Audit Trail &amp; Logs</span>
          </button>
        </>
      );
    }

    if (role === 'MONITORING_OPERATOR' || role === 'CONTROL_ROOM_OPERATOR') {
      return (
        <>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, padding: '0.5rem 0.85rem' }}>
            Telemetry &amp; Ingestion
          </div>
          <button
            onClick={() => onTabChange && onTabChange('overview')}
            className={`sidebar-link ${!currentTab || currentTab === 'overview' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Gauge size={18} />
            <span>Vishnupuri Dam Monitoring</span>
          </button>
          <button
            onClick={() => onTabChange && onTabChange('ai-predictions')}
            className={`sidebar-link ${currentTab === 'ai-predictions' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Cpu size={18} />
            <span>AI Predictive Simulation</span>
          </button>
          <button
            onClick={() => onTabChange && onTabChange('sensors')}
            className={`sidebar-link ${currentTab === 'sensors' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Radio size={18} />
            <span>Sensor Network &amp; Telemetry</span>
          </button>
          <button
            onClick={() => onTabChange && onTabChange('logs')}
            className={`sidebar-link ${currentTab === 'logs' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <FileCheck2 size={18} />
            <span>Operational Log Entry</span>
          </button>
        </>
      );
    }

    if (role === 'EMERGENCY_RESPONDER' || role === 'FIELD_RESPONDER') {
      return (
        <>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, padding: '0.5rem 0.85rem' }}>
            Field Operations
          </div>
          <button
            onClick={() => onTabChange && onTabChange('overview')}
            className={`sidebar-link ${!currentTab || currentTab === 'overview' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Truck size={18} />
            <span>Incident Queue &amp; Dispatch</span>
          </button>
          <button
            onClick={() => onTabChange && onTabChange('teams')}
            className={`sidebar-link ${currentTab === 'teams' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Users size={18} />
            <span>Response Units &amp; Boats</span>
          </button>
          <button
            onClick={() => onTabChange && onTabChange('sitrep')}
            className={`sidebar-link ${currentTab === 'sitrep' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <FileCheck2 size={18} />
            <span>Field Situation Report (SITREP)</span>
          </button>
        </>
      );
    }

    // Default: CITIZEN
    return (
      <>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, padding: '0.5rem 0.85rem' }}>
          Citizen Safety Services
        </div>
        <button
          onClick={() => onTabChange && onTabChange('alerts')}
          className={`sidebar-link ${!currentTab || currentTab === 'alerts' ? 'active' : ''}`}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          <Megaphone size={18} />
          <span>Official Public Alerts</span>
        </button>
        <button
          onClick={() => onTabChange && onTabChange('report')}
          className={`sidebar-link ${currentTab === 'report' ? 'active' : ''}`}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          <AlertTriangle size={18} />
          <span>Report Hazard / Incident</span>
        </button>
        <button
          onClick={() => onTabChange && onTabChange('my-reports')}
          className={`sidebar-link ${currentTab === 'my-reports' ? 'active' : ''}`}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          <FileCheck2 size={18} />
          <span>My Reports &amp; Official Response</span>
        </button>
        <button
          onClick={() => onTabChange && onTabChange('sos')}
          className={`sidebar-link ${currentTab === 'sos' ? 'active' : ''}`}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#ef4444' }}
        >
          <LifeBuoy size={18} />
          <span>Emergency SOS Request</span>
        </button>
        <button
          onClick={() => onTabChange && onTabChange('shelters')}
          className={`sidebar-link ${currentTab === 'shelters' ? 'active' : ''}`}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          <Home size={18} />
          <span>Relief Camps &amp; Safe Zones</span>
        </button>
        <button
          onClick={() => onTabChange && onTabChange('checklist')}
          className={`sidebar-link ${currentTab === 'checklist' ? 'active' : ''}`}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
        >
          <CheckCircle size={18} />
          <span>Family Safety Checklist</span>
        </button>
      </>
    );
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={22} color="#3b82f6" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>AAPADAMITRA</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Control Dashboard
            </div>
          </div>
        </NavLink>
      </div>

      <nav className="sidebar-menu">
        {renderNavLinks()}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{user?.fullName}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{user?.email}</div>
          <div style={{ marginTop: '0.25rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
              {role.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            padding: '0.45rem 0.75rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
