import React, { useState } from 'react';
import { DashboardLayout } from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Send 
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  location: string;
  priority: 'P1 - CRITICAL' | 'P2 - HIGH' | 'P3 - STANDARD';
  status: 'ASSIGNED' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED';
  reportedAt: string;
  assignedTeam: string;
}

export const ResponderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-2026-104',
      title: 'Waterlogging & Evacuation Assistance Needed',
      location: 'Sangvi Ghat Low-lying settlement, Godavari Bank',
      priority: 'P1 - CRITICAL',
      status: 'ON_SCENE',
      reportedAt: '10:15 AM IST',
      assignedTeam: 'SDRF Boat Unit #2 (4 Responders)',
    },
    {
      id: 'INC-2026-105',
      title: 'Road Submersion Advisory & Traffic Diversion',
      location: 'Degaon-Vishnupuri Causeway Link',
      priority: 'P2 - HIGH',
      status: 'EN_ROUTE',
      reportedAt: '10:45 AM IST',
      assignedTeam: 'Traffic Police Quick Response Team',
    },
    {
      id: 'INC-2026-106',
      title: 'Power Line Precautionary Isolation Check',
      location: 'Khadkpura Flood Plain, Nanded City',
      priority: 'P3 - STANDARD',
      status: 'ASSIGNED',
      reportedAt: '11:10 AM IST',
      assignedTeam: 'MSEDCL Emergency Linemen Crew',
    },
  ]);

  const [sitrepText, setSitrepText] = useState('');
  const [sitrepSent, setSitrepSent] = useState(false);

  const handleUpdateStatus = (id: string, newStatus: Incident['status']) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
  };

  const handleSendSitrep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sitrepText.trim()) return;
    setSitrepSent(true);
    setTimeout(() => {
      setSitrepText('');
      setSitrepSent(false);
    }, 3000);
  };

  return (
    <DashboardLayout
      title="Emergency Response &amp; Field Coordination"
      subtitle={`Commander: ${user?.fullName || 'Field Commander'} &bull; SDRF Unit / Police Control`}
      currentTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Overview Tab */}
      {(!activeTab || activeTab === 'overview') && (
        <div>
          {/* Status Metrics */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-title">Active Field Missions</div>
              <div className="stat-card-value" style={{ color: '#2563eb' }}>
                {incidents.filter((i) => i.status !== 'RESOLVED').length}
              </div>
              <div className="stat-card-desc">Ongoing flood relief dispatches</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Priority 1 (Critical)</div>
              <div className="stat-card-value" style={{ color: '#dc2626' }}>
                {incidents.filter((i) => i.priority.startsWith('P1') && i.status !== 'RESOLVED').length}
              </div>
              <div className="stat-card-desc">Direct human evacuation in progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Rescue Boats Deployed</div>
              <div className="stat-card-value">4 Boats</div>
              <div className="stat-card-desc">Godavari Downstream Reach</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Citizens Evacuated (Today)</div>
              <div className="stat-card-value" style={{ color: '#16a34a' }}>38</div>
              <div className="stat-card-desc">Moved safely to Municipal School Shelter</div>
            </div>
          </div>

          {/* Active Incidents Queue */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Assigned Field Incidents Queue</h3>
              <span className="badge badge-operational">DISPATCHED BY DEOC</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    borderLeft: inc.priority.startsWith('P1') ? '4px solid #dc2626' : '4px solid #f59e0b'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className={`badge ${inc.priority.startsWith('P1') ? 'badge-critical' : 'badge-warning'}`}>
                          {inc.priority}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{inc.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                        <MapPin size={14} color="#dc2626" />
                        <span>{inc.location}</span>
                        <span>&bull;</span>
                        <Clock size={14} />
                        <span>Reported: {inc.reportedAt}</span>
                      </div>
                    </div>

                    <div>
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        {inc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: '#334155', marginBottom: '1rem' }}>
                    <strong>Assigned Unit:</strong> {inc.assignedTeam}
                  </div>

                  {/* Status Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      disabled={inc.status === 'EN_ROUTE'}
                      onClick={() => handleUpdateStatus(inc.id, 'EN_ROUTE')}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      Mark En Route
                    </button>
                    <button
                      disabled={inc.status === 'ON_SCENE'}
                      onClick={() => handleUpdateStatus(inc.id, 'ON_SCENE')}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#d97706', borderColor: '#fde68a' }}
                    >
                      Mark On Scene
                    </button>
                    <button
                      disabled={inc.status === 'RESOLVED'}
                      onClick={() => handleUpdateStatus(inc.id, 'RESOLVED')}
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#16a34a' }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Response Units &amp; Equipment Inventory</h3>
            <span className="badge badge-operational">FIELD READY</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unit Name</th>
                  <th>Strength</th>
                  <th>Primary Equipment</th>
                  <th>Stationed Location</th>
                  <th>Readiness</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>SDRF Alpha Team</td>
                  <td>12 Responders</td>
                  <td>2 Inflatable Rescue Boats (IRB), 25 Life Jackets</td>
                  <td>Vishnupuri Barrage Site Camp</td>
                  <td><span className="badge badge-operational">ACTIVE DEPLOYED</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Municipal Fire &amp; Rescue Crew</td>
                  <td>8 Personnel</td>
                  <td>2 High-capacity Dewatering Pumps, Ladder Truck</td>
                  <td>Nanded Station Fire Post</td>
                  <td><span className="badge badge-operational">STANDBY</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>District Health Medical Unit</td>
                  <td>4 Paramedics, 2 Doctors</td>
                  <td>108 Advanced Life Support Ambulance, Trauma Kits</td>
                  <td>Civil Hospital Base</td>
                  <td><span className="badge badge-operational">ON-CALL</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SITREP Tab */}
      {activeTab === 'sitrep' && (
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Dispatch Field Situation Report (SITREP) to DEOC
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Transmit verified field observations directly to District Collectorate control room.
          </p>

          {sitrepSent ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '8px', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} />
              <span>SITREP transmission logged successfully. DEOC operations desk updated.</span>
            </div>
          ) : (
            <form onSubmit={handleSendSitrep}>
              <div className="form-group">
                <label className="form-label">SITREP Narrative &amp; Ground Conditions</label>
                <textarea
                  required
                  rows={5}
                  className="form-textarea"
                  value={sitrepText}
                  onChange={(e) => setSitrepText(e.target.value)}
                  placeholder="Detail water inundation depth, road passability, number of citizens assisted, and required logistical reinforcements..."
                />
              </div>
              <button type="submit" className="btn-primary">
                <Send size={16} />
                <span>Transmit Official SITREP</span>
              </button>
            </form>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};
