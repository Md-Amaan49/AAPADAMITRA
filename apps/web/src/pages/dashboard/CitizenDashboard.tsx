import React, { useState } from 'react';
import { DashboardLayout } from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  LifeBuoy, 
  CheckCircle, 
  PhoneCall, 
  Send, 
  X, 
  AlertOctagon 
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('alerts');

  // Emergency SOS Modal State
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosConfirmed, setSosConfirmed] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);

  // Incident Reporting Form State
  const [reportForm, setReportForm] = useState({
    hazardType: 'WATERLOGGING',
    locality: '',
    description: '',
    contactPhone: '',
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);

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

  const handleTriggerSOS = () => {
    if (!sosConfirmed) return;
    setSosDispatched(true);
    setTimeout(() => {
      setSosModalOpen(false);
      setSosDispatched(false);
      setSosConfirmed(false);
    }, 4000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
  };

  return (
    <DashboardLayout
      title="Citizen Safety &amp; Emergency Portal"
      subtitle={`Welcome, ${user?.fullName || 'Resident'} &bull; District: Nanded, Maharashtra`}
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
                  SOS Distress Alert Dispatched to DEOC
                </h4>
                <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Your incident has been transmitted to Nanded District Emergency Control Desk (Ticket #SOS-{Math.floor(1000 + Math.random() * 9000)}). Stay in place on high ground if safe.
                </p>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#991b1b' }}>
                  Keep your phone line free. Emergency responders may call you immediately.
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Triggering SOS transmits an immediate life-safety distress alert with your user profile and current jurisdiction to the District Emergency Operations Centre (DEOC) for priority dispatch.
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

      {/* Emergency Distress Banner */}
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
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <LifeBuoy size={20} />
            <span>Are You Trapped or in Immediate Danger?</span>
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
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Verified Disaster Alerts &amp; Official Advisories
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              All alerts displayed below have been authenticated by the District Disaster Management Authority (DDMA), Nanded.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Active Alert 1 */}
            <div className="card" style={{ borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-warning">WATER DISCHARGE WARNING</span>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Vishnupuri Dam Controlled Release</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Issued: Today, 08:30 AM IST &bull; Authority: DEOC Nanded
                </div>
              </div>
              <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                4 radial gates of Vishnupuri Barrage have been opened to 1.2 meters. Citizens residing along the banks of Godavari River in Sangvi, Degaon, and Vishnupuri are advised not to venture near the riverbed and to move livestock to higher terrain.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                <span>Target Region: <strong>Godavari Riverbank Villages</strong></span>
                <span>Expected Duration: <strong>Next 12 Hours</strong></span>
              </div>
            </div>

            {/* Active Alert 2 */}
            <div className="card" style={{ borderLeft: '4px solid #3b82f6', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-info">WEATHER ADVISORY</span>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Moderate to Heavy Rain Forecast (IMD)</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Issued: Today, 06:00 AM IST &bull; Authority: Regional Met Centre
                </div>
              </div>
              <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Scattered heavy rainfall accompanied by gusty winds expected across Nanded, Biloli, and Mudkhed talukas over the next 24 to 48 hours. Fishermen and boat operators are advised to suspend operations.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                <span>Target Region: <strong>Nanded District (All Talukas)</strong></span>
                <span>Severity: <strong>Yellow Watch</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incident Reporting Tab */}
      {activeTab === 'report' && (
        <div className="card">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
            Report a Local Hazard or Ground Incident
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Provide timely information on local waterlogging, breach of culverts, fallen electrical trees, or trapped citizens.
          </p>

          {reportSubmitted ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <CheckCircle size={40} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>Citizen Report Successfully Logged</h3>
              <p style={{ color: '#14532d', fontSize: '0.85rem' }}>
                Report Reference ID #CIT-{Math.floor(100000 + Math.random() * 900000)} has been assigned and dispatched to field response teams. Thank you for your community vigilance.
              </p>
              <button
                onClick={() => setReportSubmitted(false)}
                className="btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                Submit Another Report
              </button>
            </div>
          ) : (
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
                  <label className="form-label">Locality / Landmark in Nanded</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={reportForm.locality}
                    onChange={(e) => setReportForm({ ...reportForm, locality: e.target.value })}
                    placeholder="e.g. Near Sangvi Ghat Temple, Nanded"
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
                  placeholder="Describe the estimated water depth, affected houses, number of people stranded, or route blockages..."
                />
              </div>

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

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b', marginBottom: '1.25rem' }}>
                False reports waste critical rescue resources and are punishable by law.
              </div>

              <button type="submit" className="btn-primary">
                <Send size={16} />
                <span>Submit Verified Incident Report</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Relief Shelters Tab */}
      {activeTab === 'shelters' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Designated DDMA Relief Shelters &amp; Camps</h3>
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
                <tr>
                  <td style={{ fontWeight: 600 }}>Government Polytechnic College Camp</td>
                  <td>Baba Nagar, Nanded</td>
                  <td>500 Citizens</td>
                  <td>Drinking water, Emergency medical desk, Power backup</td>
                  <td>02462-251234</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Municipal Corporation School #4</td>
                  <td>Old Nanded Market Road</td>
                  <td>300 Citizens</td>
                  <td>Food rations, Community kitchen, First aid</td>
                  <td>02462-234890</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Biloli Tehsil Community Hall</td>
                  <td>Tehsil Campus, Biloli</td>
                  <td>400 Citizens</td>
                  <td>Resting mats, Sanitation units, Clean water</td>
                  <td>02465-220111</td>
                </tr>
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
            Keep your family prepared ahead of heavy monsoon or dam discharge periods.
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
                Awareness of the nearest DDMA relief shelter and safe high-ground route
              </span>
            </label>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
