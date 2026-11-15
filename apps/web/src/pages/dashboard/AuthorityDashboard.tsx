import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useDistrict } from '../../context/DistrictContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Gauge, 
  Radio, 
  Send, 
  MessageSquare, 
  X 
} from 'lucide-react';
import { 
  fetchPendingAlerts, 
  fetchActiveAlerts, 
  approveDisasterAlert, 
  rejectDisasterAlert,
  fetchDistrictIncidents,
  respondToCitizenIncident
} from '../../services/apiClient';
import { AlertCountdown } from '../../components/alerts/AlertCountdown';

export const AuthorityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentDistrict } = useDistrict();
  const [activeTab, setActiveTab] = useState('overview');

  // Pending & Broadcasted Alerts State
  const [pendingAlerts, setPendingAlerts] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Approval Modal Configuration
  const [selectedAlertToApprove, setSelectedAlertToApprove] = useState<any | null>(null);
  const [durationHours, setDurationHours] = useState(6);
  const [onsetMinutes, setOnsetMinutes] = useState(30);
  const [customAdvisory, setCustomAdvisory] = useState('');

  // Citizen Incidents & Two-Way Feedback State
  const [incidents, setIncidents] = useState<any[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [selectedIncidentToRespond, setSelectedIncidentToRespond] = useState<any | null>(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [responseAction, setResponseAction] = useState('DISPATCH_RESCUE_TEAM');
  const [newStatus, setNewStatus] = useState('INSPECTION_DISPATCHED');

  const [notification, setNotification] = useState<string | null>(null);

  const loadData = () => {
    setAlertsLoading(true);
    fetchPendingAlerts(currentDistrict)
      .then((data) => setPendingAlerts(data))
      .catch(() => setPendingAlerts([]));

    fetchActiveAlerts(currentDistrict)
      .then((data) => setActiveAlerts(data))
      .catch(() => setActiveAlerts([]))
      .finally(() => setAlertsLoading(false));

    setIncidentsLoading(true);
    fetchDistrictIncidents(currentDistrict)
      .then((data) => setIncidents(data))
      .catch(() => setIncidents([]))
      .finally(() => setIncidentsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [currentDistrict]);

  const handleOpenApproveModal = (alertItem: any) => {
    setSelectedAlertToApprove(alertItem);
    setDurationHours(alertItem.durationHours || 6);
    setOnsetMinutes(30);
    setCustomAdvisory('');
  };

  const handleConfirmApproval = async () => {
    if (!selectedAlertToApprove) return;
    try {
      const payload = {
        durationHours: Number(durationHours),
        onsetMinutes: Number(onsetMinutes),
        customAdvisory: customAdvisory.trim() || undefined,
        approvedBy: user?.fullName || `District Collector, ${currentDistrict}`,
      };

      await approveDisasterAlert(selectedAlertToApprove.id, payload);
      setNotification(`Alert ${selectedAlertToApprove.id} has been formally authorized and broadcast to ${currentDistrict} public channels.`);
      setSelectedAlertToApprove(null);
      loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectAlert = async (id: string) => {
    const reason = prompt('Enter statutory reason for rejection/archival:') || 'Parameters within normal thresholds';
    try {
      await rejectDisasterAlert(id, { reason });
      setNotification(`Alert proposal ${id} was rejected and archived to audit log.`);
      loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Reject failed');
    }
  };

  const handleTransmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentToRespond || !responseMsg.trim()) return;

    try {
      const payload = {
        message: responseMsg.trim(),
        actionTaken: responseAction,
        newStatus: newStatus,
        responderName: user?.fullName || `DEOC Commander (${currentDistrict})`,
      };

      await respondToCitizenIncident(selectedIncidentToRespond.id, payload);
      setNotification(`Official dispatch response sent to citizen for Report #${selectedIncidentToRespond.id}.`);
      setSelectedIncidentToRespond(null);
      setResponseMsg('');
      loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to transmit response');
    }
  };

  return (
    <DashboardLayout
      title="District Disaster Management Command"
      subtitle={`Welcome, ${user?.fullName || 'Collector & District Magistrate'} • Jurisdiction: ${currentDistrict.toUpperCase()}`}
      currentTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Toast Notification */}
      {notification && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Authority Approval Modal with Countdown Configuration */}
      {selectedAlertToApprove && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8' }}>
                <CheckCircle2 size={22} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>AUTHORIZE DISASTER ALERT BROADCAST</h3>
              </div>
              <button
                onClick={() => setSelectedAlertToApprove(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.825rem' }}>
              <div><strong>Proposal:</strong> {selectedAlertToApprove.title}</div>
              <div style={{ color: '#64748b', marginTop: '0.25rem' }}>Target: <strong>{selectedAlertToApprove.district} ({selectedAlertToApprove.affectedAreas?.join(', ')})</strong></div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Disaster Onset Lead Time (Minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={onsetMinutes}
                  onChange={(e) => setOnsetMinutes(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alert Active Lifespan (Hours)</label>
                <input
                  type="number"
                  className="form-input"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Custom Administrative Directive / Evacuation Route</label>
              <textarea
                rows={2}
                className="form-textarea"
                value={customAdvisory}
                onChange={(e) => setCustomAdvisory(e.target.value)}
                placeholder="e.g. Move livestock immediately towards Degaon bypass. Siren sounded."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => setSelectedAlertToApprove(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmApproval} className="btn-primary">
                <CheckCircle2 size={16} />
                <span>Sign &amp; Broadcast Live with Countdown</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Way Citizen Incident Response Modal */}
      {selectedIncidentToRespond && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534' }}>
                <Send size={20} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>RESPOND TO CITIZEN GROUND INCIDENT</h3>
              </div>
              <button
                onClick={() => setSelectedIncidentToRespond(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.825rem' }}>
              <div><strong>Report #{selectedIncidentToRespond.id}:</strong> {selectedIncidentToRespond.locality} ({selectedIncidentToRespond.district})</div>
              <div style={{ color: '#475569', marginTop: '0.25rem' }}><strong>Reported Condition:</strong> {selectedIncidentToRespond.description}</div>
              <div style={{ color: '#64748b', marginTop: '0.25rem' }}>Citizen: {selectedIncidentToRespond.citizenName} &bull; Phone: {selectedIncidentToRespond.citizenPhone}</div>
            </div>

            <form onSubmit={handleTransmitResponse}>
              <div className="form-group">
                <label className="form-label">Official Feedback Message (Visible to Citizen)</label>
                <textarea
                  required
                  rows={3}
                  className="form-textarea"
                  value={responseMsg}
                  onChange={(e) => setResponseMsg(e.target.value)}
                  placeholder="e.g. SDRF Boat Unit #2 dispatched from Vishnupuri base. Rescue personnel arriving in 15 mins."
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Action Classification</label>
                  <select
                    className="form-select"
                    value={responseAction}
                    onChange={(e) => setResponseAction(e.target.value)}
                  >
                    <option value="DISPATCH_RESCUE_TEAM">Dispatch SDRF / Rescue Boats</option>
                    <option value="DEPLOY_PUMPS">Deploy Dewatering Pumps</option>
                    <option value="POLICE_BARRICADE">Erect Police Causeway Barricades</option>
                    <option value="MEDICAL_AMBULANCE">Dispatch 108 Ambulance Unit</option>
                    <option value="VERIFIED_UNDER_MONITORING">Verified &bull; Low Danger Threshold</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Update Incident Status</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="INSPECTION_DISPATCHED">Inspection Dispatched</option>
                    <option value="ACTION_TAKEN">Action Taken</option>
                    <option value="RESOLVED">Resolved / Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setSelectedIncidentToRespond(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Send size={16} />
                  <span>Transmit Official Feedback to Citizen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {(!activeTab || activeTab === 'overview') && (
        <div>
          {/* Top KPI Grid */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-title">{currentDistrict} Alert State</div>
              <div className="stat-card-value" style={{ color: '#2563eb' }}>LEVEL-1</div>
              <div className="stat-card-desc">Active Disaster Operations Center</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Live Active Broadcasts</div>
              <div className="stat-card-value" style={{ color: activeAlerts.length > 0 ? '#dc2626' : '#16a34a' }}>
                {activeAlerts.length}
              </div>
              <div className="stat-card-desc">Ticking countdown active in {currentDistrict}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Pending Model Proposals</div>
              <div className="stat-card-value" style={{ color: '#d97706' }}>
                {pendingAlerts.length}
              </div>
              <div className="stat-card-desc">Human-in-the-loop review required</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Citizen Incident Reports</div>
              <div className="stat-card-value" style={{ color: '#16a34a' }}>
                {incidents.length}
              </div>
              <div className="stat-card-desc">Two-way citizen feedback queue</div>
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#f8fafc' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Human-in-the-Loop &amp; Citizen Dispatch Desk</h3>
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                Review unvetted AI predictions or transmit official dispatch feedback directly to reporting citizens.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('alerts')}
                className="btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                <AlertTriangle size={15} />
                <span>Review Pending Alerts ({pendingAlerts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('citizen-reports')}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Radio size={15} />
                <span>Citizen Reports ({incidents.length})</span>
              </button>
            </div>
          </div>

          {/* Active Broadcasts with Live Countdown Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Active Disseminated Bulletins for {currentDistrict}</h3>
              <span className="badge badge-operational">OFFICIAL DIRECTIVES</span>
            </div>
            {alertsLoading ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                Fetching operational bulletins for {currentDistrict}...
              </div>
            ) : activeAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                No active broadcast bulletins currently in {currentDistrict}.
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Alert ID</th>
                      <th>Hazard</th>
                      <th>Severity</th>
                      <th>Live Remaining Countdown</th>
                      <th>Target Areas</th>
                      <th>Authorized By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAlerts.map((alert) => (
                      <tr key={alert.id}>
                        <td style={{ fontWeight: 600 }}>{alert.id}</td>
                        <td>{alert.hazardType}</td>
                        <td>
                          <span className={`badge ${alert.severity === 'CRITICAL_EVACUATION' || alert.severity === 'WARNING' ? 'badge-critical' : 'badge-warning'}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td>
                          <AlertCountdown
                            onsetAt={alert.onsetAt}
                            expiresAt={alert.expiresAt}
                            compact={true}
                          />
                        </td>
                        <td>{alert.affectedAreas?.join(', ')}</td>
                        <td style={{ fontSize: '0.8rem', color: '#475569' }}>{alert.approvedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert Approvals Tab (HITL) */}
      {activeTab === 'alerts' && (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Pending AI Prediction Alerts for {currentDistrict}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Review machine-generated risk models and hydraulic simulations before public broadcast.
              </p>
            </div>
            <button onClick={loadData} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
              Refresh Proposals
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {pendingAlerts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <CheckCircle2 size={42} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#166534' }}>All Proposals Cleared</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  No unreviewed AI model proposals currently pending for {currentDistrict}.
                </p>
              </div>
            ) : (
              pendingAlerts.map((item) => (
                <div key={item.id} className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-warning">{item.severity}</span>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.title}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({item.id})</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Source: <strong>{item.sourceDetails}</strong> &bull; Model Confidence: <strong style={{ color: '#1d4ed8' }}>{item.confidenceScore}%</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>TARGET JURISDICTION</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>{item.district} ({item.affectedAreas?.join(', ')})</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>PREDICTED SCENARIO &amp; ADVISORY</div>
                    <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                      {item.summary}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleRejectAlert(item.id)}
                      className="btn-secondary"
                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                    >
                      <XCircle size={16} />
                      <span>Reject &amp; Archive</span>
                    </button>
                    <button
                      onClick={() => handleOpenApproveModal(item)}
                      className="btn-primary"
                    >
                      <CheckCircle2 size={16} />
                      <span>Authorize &amp; Issue Live Broadcast</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Citizen Incident Reports & Two-Way Feedback Desk */}
      {activeTab === 'citizen-reports' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 className="card-title">Citizen Incident Reports in {currentDistrict}</h3>
              <p style={{ color: '#64748b', fontSize: '0.825rem', margin: '0.25rem 0 0 0' }}>
                Review on-ground reports from residents and transmit direct official response feedback.
              </p>
            </div>
            <button onClick={loadData} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
              Refresh Reports
            </button>
          </div>

          {incidentsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading incidents...</div>
          ) : incidents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              No ground incident reports recorded for {currentDistrict}.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-info">{inc.hazardType}</span>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{inc.locality}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({inc.id})</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Citizen: <strong>{inc.citizenName}</strong> &bull; Mobile: <strong>{inc.citizenPhone}</strong> &bull; {new Date(inc.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${inc.status === 'RESOLVED' ? 'badge-operational' : inc.status === 'INSPECTION_DISPATCHED' ? 'badge-warning' : 'badge-info'}`}>
                        {inc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {inc.description}
                  </p>

                  {/* Current Authority Response Preview if any */}
                  {inc.authorityResponse && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.825rem', color: '#166534' }}>
                      <strong>Active Response Transmitted:</strong> {inc.authorityResponse.message}
                      <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>
                        Action: {inc.authorityResponse.actionTaken} &bull; Transmitted by {inc.authorityResponse.respondedBy}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setSelectedIncidentToRespond(inc);
                        setResponseMsg(inc.authorityResponse?.message || '');
                      }}
                      className="btn-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      <MessageSquare size={14} />
                      <span>{inc.authorityResponse ? 'Update Official Response' : 'Send Official Response / Dispatch'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Infrastructure Tab */}
      {activeTab === 'infrastructure' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Critical Infrastructure &amp; Hydraulic Assets
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Monitoring focal hydraulic assets and regional hydrological telemetry stations in {currentDistrict}.
            </p>
          </div>

          <div className="grid-2">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Gauge size={22} color="#1d4ed8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {currentDistrict === 'Mumbai' ? 'Mithi River Barrage & Sea Gates' : 'Shankarrao Chavan Vishnupuri Barrage'}
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Basin &amp; River</span>
                  <span style={{ fontWeight: 600 }}>{currentDistrict === 'Mumbai' ? 'Mithi River Basin, Mumbai' : 'Godavari River, Nanded'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Full Reservoir Level (FRL)</span>
                  <span style={{ fontWeight: 600 }}>{currentDistrict === 'Mumbai' ? '4.80 m (Tide Mark)' : '355.00 m'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Current Stage</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>{currentDistrict === 'Mumbai' ? '3.12 m (Safe)' : '353.40 m (Normal)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Active Gates / Pumps</span>
                  <span style={{ fontWeight: 600 }}>{currentDistrict === 'Mumbai' ? '6 Storm Sluice Gates' : '18 Radial Gates (4 Active)'}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Radio size={22} color="#0891b2" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Connected Telemetry Stations</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{currentDistrict === 'Mumbai' ? 'Worli Coastal Radar (IMD)' : 'Nanded Bridge Gauge (CWC)'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Stage: Normal Telemetry</div>
                  </div>
                  <span className="badge badge-operational">ONLINE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{currentDistrict === 'Mumbai' ? 'Kurla AWS Weather Station' : 'Vishnupuri Barrage Inflow Station'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Frequency: 5-min intervals</div>
                  </div>
                  <span className="badge badge-operational">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
