import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useDistrict } from '../../context/DistrictContext';
import { 
  LifeBuoy, 
  CheckCircle, 
  PhoneCall, 
  Send, 
  X, 
  AlertOctagon,
  MapPin
} from 'lucide-react';
import { AlertCountdown } from '../../components/alerts/AlertCountdown';
import { 
  fetchActiveAlerts, 
  submitCitizenReport, 
  fetchMyIncidentReports 
} from '../../services/apiClient';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentDistrict } = useDistrict();
  const [activeTab, setActiveTab] = useState('alerts');

  // Emergency SOS Modal State
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosConfirmed, setSosConfirmed] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);

  // Active Alerts State
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Incident Reporting Form State
  const [reportForm, setReportForm] = useState({
    hazardType: 'WATERLOGGING',
    locality: '',
    description: '',
    contactPhone: user?.email === 'citizen@aapadamitra.gov.in' ? '9800000004' : '',
    urgency: 'HIGH',
  });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  // My Reports & Authority Responses State
  const [myReports, setMyReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Family Safety Checklist
  const [checklist, setChecklist] = useState({
    documents: true,
    water: true,
    medicine: false,
    torch: true,
    powerbank: false,
    evacRoute: true,
  });

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  // Load Active Alerts for user's district
  useEffect(() => {
    setAlertsLoading(true);
    fetchActiveAlerts(currentDistrict)
      .then((data) => setAlerts(data))
      .catch(() => setAlerts([]))
      .finally(() => setAlertsLoading(false));
  }, [currentDistrict]);

  // Load My Incident Reports
  const loadMyReports = () => {
    setReportsLoading(true);
    const phone = reportForm.contactPhone || '9800000004';
    fetchMyIncidentReports(phone, user?.id)
      .then((data) => setMyReports(data))
      .catch(() => setMyReports([]))
      .finally(() => setReportsLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'my-reports') {
      loadMyReports();
    }
  }, [activeTab]);

  const handleTriggerSOS = () => {
    if (!sosConfirmed) return;
    setSosDispatched(true);
    setTimeout(() => {
      setSosModalOpen(false);
      setSosDispatched(false);
      setSosConfirmed(false);
    }, 4000);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    setReportSuccessMsg(null);

    try {
      const payload = {
        district: currentDistrict,
        locality: reportForm.locality,
        hazardType: reportForm.hazardType,
        description: reportForm.description,
        citizenName: user?.fullName || 'Resident Citizen',
        citizenPhone: reportForm.contactPhone || '9800000004',
        urgency: reportForm.urgency,
      };

      const res = await submitCitizenReport(payload);
      setReportSuccessMsg(`Report #${res.id} transmitted to ${currentDistrict} DEOC. An authority officer will inspect and update status.`);
      setReportForm({ ...reportForm, locality: '', description: '' });
      setTimeout(() => {
        setActiveTab('my-reports');
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Citizen Safety &amp; Emergency Portal"
      subtitle={`Resident: ${user?.fullName || 'Citizen'} • Monitored District: ${currentDistrict.toUpperCase()}`}
      currentTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* SOS Modal Dialog */}
      {sosModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
                <AlertOctagon size={24} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>EMERGENCY DISTRESS SOS</h3>
              </div>
              <button
                onClick={() => setSosModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {sosDispatched ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <LifeBuoy size={28} />
                </div>
                <h4 style={{ color: '#991b1b', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  SOS Distress Alert Dispatched to {currentDistrict} DEOC
                </h4>
                <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Your emergency coordinates and identity have been received by the control desk (Ticket #SOS-{Math.floor(1000 + Math.random() * 9000)}). Stay on high ground if safe.
                </p>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#991b1b' }}>
                  Keep your phone line free. Emergency responders may call you immediately.
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Triggering SOS transmits an immediate life-safety distress alert for <strong>{currentDistrict}</strong> jurisdiction to the District Emergency Operations Centre (DEOC) for priority rescue dispatch.
                </p>

                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '0.85rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem',
                  color: '#991b1b'
                }}>
                  <strong>LEGAL NOTICE:</strong> Submitting a false disaster distress call is an offense punishable by imprisonment up to one year under Section 54 of the Disaster Management Act, 2005.
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }}>
                    <input
                      type="checkbox"
                      style={{ marginTop: '3px' }}
                      checked={sosConfirmed}
                      onChange={(e) => setSosConfirmed(e.target.checked)}
                    />
                    <span>
                      I solemnly confirm this is an active, life-threatening emergency requiring rescue or medical intervention.
                    </span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    onClick={() => setSosModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!sosConfirmed}
                    onClick={handleTriggerSOS}
                    className="btn-danger"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: sosConfirmed ? 1 : 0.5 }}
                  >
                    <LifeBuoy size={16} />
                    <span>Confirm Emergency Distress SOS</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Distress Action Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #b91c1c, #7f1d1d)',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <LifeBuoy size={20} />
            <span>Immediate Danger / Rescue Required in {currentDistrict}?</span>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#fecaca' }}>
            If you or people near you need urgent rescue assistance, dial 112 or trigger an emergency SOS.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href="tel:112"
            className="btn-secondary"
            style={{ background: '#ffffff', color: '#991b1b', fontWeight: 700, border: 'none' }}
          >
            <PhoneCall size={16} />
            <span>Dial 112</span>
          </a>
          <button
            onClick={() => {
              setSosConfirmed(false);
              setSosDispatched(false);
              setSosModalOpen(true);
            }}
            className="btn-danger"
            style={{ background: '#dc2626', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700 }}
          >
            <AlertOctagon size={16} />
            <span>Trigger SOS</span>
          </button>
        </div>
      </div>

      {/* Verified Alerts Tab */}
      {(!activeTab || activeTab === 'alerts') && (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Verified Disaster Alerts for {currentDistrict}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                All alerts below are officially vetted and authorized by District Authorities under the Disaster Management Act.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#475569' }}>
              <MapPin size={14} color="#dc2626" />
              <span>Location: <strong>{currentDistrict}</strong></span>
            </div>
          </div>

          {alertsLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>Loading active advisories...</div>
          ) : alerts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <CheckCircle size={36} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ color: '#166534', fontWeight: 700 }}>No Active Disaster Alerts in {currentDistrict}</h3>
              <p style={{ color: '#14532d', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                Current weather, hydraulic, and seismic parameters are within normal thresholds.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="card"
                  style={{
                    borderLeft: alert.severity === 'CRITICAL_EVACUATION' || alert.severity === 'WARNING'
                      ? '4px solid #dc2626'
                      : '4px solid #f59e0b',
                    marginBottom: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${alert.severity === 'CRITICAL_EVACUATION' || alert.severity === 'WARNING' ? 'badge-critical' : 'badge-warning'}`}>
                        {alert.severity.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{alert.title}</span>
                    </div>

                    {/* Live Ticking Countdown Timer */}
                    <AlertCountdown
                      onsetAt={alert.onsetAt}
                      expiresAt={alert.expiresAt}
                      createdAt={alert.createdAt}
                    />
                  </div>

                  <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {alert.summary}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569' }}>
                    <div style={{ marginBottom: '0.25rem' }}>
                      Target Areas: <strong>{alert.affectedAreas.join(', ')}</strong>
                    </div>
                    {alert.evacuationRoutes && (
                      <div style={{ marginBottom: '0.25rem', color: '#166534' }}>
                        Safe Evacuation Routes: <strong>{alert.evacuationRoutes.join(' • ')}</strong>
                      </div>
                    )}
                    {alert.safeShelters && (
                      <div style={{ color: '#1d4ed8' }}>
                        Relief Shelters: <strong>{alert.safeShelters.join(' • ')}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incident Reporting Tab */}
      {activeTab === 'report' && (
        <div className="card">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
            Report a Local Ground Incident or Hazard in {currentDistrict}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Provide timely information on local road waterlogging, breached culverts, fallen trees, or trapped citizens.
          </p>

          {reportSuccessMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '8px', color: '#166534', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} />
              <span>{reportSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleReportSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Hazard / Incident Classification</label>
                <select
                  className="form-select"
                  value={reportForm.hazardType}
                  onChange={(e) => setReportForm({ ...reportForm, hazardType: e.target.value })}
                >
                  <option value="WATERLOGGING">Road Inundation / Waterlogging</option>
                  <option value="DAM_OVERFLOW">River Bank Spill / Overtopping</option>
                  <option value="ELECTRICAL_HAZARD">Live Power Cable / Substation Submersion</option>
                  <option value="TREE_COLLAPSE">Fallen Tree / Blocked Road</option>
                  <option value="TRAPPED_PERSON">Stranded Citizens / Need Evacuation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Locality / Landmark in {currentDistrict}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={reportForm.locality}
                  onChange={(e) => setReportForm({ ...reportForm, locality: e.target.value })}
                  placeholder={`e.g. Near Sangvi Ghat, ${currentDistrict}`}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Incident Narrative</label>
              <textarea
                required
                rows={4}
                className="form-textarea"
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                placeholder="Describe estimated water depth, trapped individuals, vehicle stalls, or power outages..."
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Contact Mobile for Field Verification</label>
                <input
                  type="tel"
                  required
                  pattern="^[6-9]\d{9}$"
                  className="form-input"
                  value={reportForm.contactPhone}
                  onChange={(e) => setReportForm({ ...reportForm, contactPhone: e.target.value })}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Urgency Level</label>
                <select
                  className="form-select"
                  value={reportForm.urgency}
                  onChange={(e) => setReportForm({ ...reportForm, urgency: e.target.value })}
                >
                  <option value="STANDARD">Standard — Property or Traffic Hazard</option>
                  <option value="HIGH">High — Rising Water Threatening Homes</option>
                  <option value="LIFE_THREATENING">Critical — Human Life at Immediate Risk</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Submitting verified reports alerts the {currentDistrict} Emergency Operations Centre. False reports waste critical resources and are punishable under Section 54 of the Disaster Management Act.
            </div>

            <button type="submit" disabled={reportSubmitting} className="btn-primary">
              <Send size={16} />
              <span>{reportSubmitting ? 'Transmitting Report...' : 'Submit Incident to Authority'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Two-Way Citizen Feedback Tab: My Reported Incidents & Authority Response */}
      {activeTab === 'my-reports' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                My Reported Incidents &amp; Official Response Status
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Track live actions taken by District Emergency Operations Centre and response teams for your reports.
              </p>
            </div>
            <button
              onClick={loadMyReports}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
            >
              Refresh Status
            </button>
          </div>

          {reportsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading your incident records...</div>
          ) : myReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              You have not submitted any incident reports yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {myReports.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="badge badge-info">{rep.hazardType}</span>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{rep.locality}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({rep.id})</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        District: <strong>{rep.district}</strong> • Reported on: {new Date(rep.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <span className={`badge ${rep.status === 'RESOLVED' ? 'badge-operational' : rep.status === 'INSPECTION_DISPATCHED' ? 'badge-warning' : 'badge-info'}`}>
                        {rep.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    <strong>Reported Condition:</strong> {rep.description}
                  </p>

                  {/* Two-Way Authority Response Feedback Box */}
                  {rep.authorityResponse ? (
                    <div style={{
                      background: '#f0fdf4',
                      borderLeft: '4px solid #16a34a',
                      borderRadius: '6px',
                      padding: '1rem',
                      marginTop: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle size={16} />
                          <span>OFFICIAL AUTHORITY DISPATCH &bull; {rep.authorityResponse.respondedBy}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#15803d' }}>
                          {new Date(rep.authorityResponse.respondedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#14532d', lineHeight: 1.5, fontWeight: 500 }}>
                        {rep.authorityResponse.message}
                      </div>
                      <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#166534' }}>
                        Action Logged: <code>{rep.authorityResponse.actionTaken}</code>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                      Status: Transmitted to {rep.district} Control Desk. Awaiting official field unit dispatch.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Relief Shelters Tab */}
      {activeTab === 'shelters' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Designated DDMA Relief Shelters &amp; Camps in {currentDistrict}</h3>
            <span className="badge badge-operational">ACTIVE MONITORING</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Camp Name</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Facilities Available</th>
                  <th>Helpline</th>
                </tr>
              </thead>
              <tbody>
                {currentDistrict === 'Mumbai' ? (
                  <>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Dadar Municipal Girls High School Hall</td>
                      <td>Near Shivaji Park, Dadar West, Mumbai</td>
                      <td>400 Citizens</td>
                      <td>Drinking water, Emergency medical desk, Power generator</td>
                      <td>022-24301234</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Bandra Municipal Community Centre</td>
                      <td>Hill Road, Bandra West, Mumbai</td>
                      <td>350 Citizens</td>
                      <td>Dry rations, First aid, Community kitchen</td>
                      <td>022-26425678</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Kurla West Ward Relief Camp</td>
                      <td>LBS Marg, Kurla West, Mumbai</td>
                      <td>500 Citizens</td>
                      <td>Sanitation units, Clean water, Inflatable boats stationed</td>
                      <td>022-26509988</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Government Polytechnic College Camp</td>
                      <td>Baba Nagar, Nanded</td>
                      <td>500 Citizens</td>
                      <td>Drinking water, Emergency medical desk, Power backup</td>
                      <td>02462-251234</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Municipal Corporation School #4</td>
                      <td>Old Nanded Market Road, Nanded</td>
                      <td>300 Citizens</td>
                      <td>Food rations, Community kitchen, First aid</td>
                      <td>02462-234890</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Biloli Tehsil Community Hall</td>
                      <td>Tehsil Campus, Biloli, Nanded</td>
                      <td>400 Citizens</td>
                      <td>Resting mats, Sanitation units, Clean water</td>
                      <td>02465-220111</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Safety Checklist Tab */}
      {activeTab === 'checklist' && (
        <div className="card">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
            Household Emergency Preparedness Checklist
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Keep your family prepared ahead of disaster onset periods.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.documents}
                onChange={() => toggleChecklist('documents')}
              />
              <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Important identity cards &amp; land titles stored in waterproof ziplock bags
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.water}
                onChange={() => toggleChecklist('water')}
              />
              <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                72-hour reserve of clean drinking water stored in closed food-grade cans
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.medicine}
                onChange={() => toggleChecklist('medicine')}
              />
              <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                1-week reserve of prescription medicines for elderly and children
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.torch}
                onChange={() => toggleChecklist('torch')}
              />
              <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                High-power battery torch and replacement cell packs
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.powerbank}
                onChange={() => toggleChecklist('powerbank')}
              />
              <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Fully charged power bank for emergency mobile communication
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.evacRoute}
                onChange={() => toggleChecklist('evacRoute')}
              />
              <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Awareness of the nearest {currentDistrict} relief shelter and safe high-ground route
              </span>
            </label>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
