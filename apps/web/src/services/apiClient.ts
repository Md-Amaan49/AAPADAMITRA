import { HealthCheckResponse } from '@aapadamitra/contracts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export async function fetchApiHealth(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchAiHealth() {
  const response = await fetch(`${API_BASE_URL}/ai/health`);
  if (!response.ok) {
    throw new Error(`AI Health request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchAiModels() {
  const response = await fetch(`${API_BASE_URL}/ai/models`);
  if (!response.ok) {
    throw new Error(`AI Models request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchAiHazards() {
  const response = await fetch(`${API_BASE_URL}/ai/hazards`);
  if (!response.ok) {
    throw new Error(`AI Hazards request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchModelInfo(hazard: string) {
  const response = await fetch(`${API_BASE_URL}/ai/models/${hazard}/info`);
  if (!response.ok) {
    throw new Error(`Model info request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchTriggerConfigs() {
  const response = await fetch(`${API_BASE_URL}/ai/triggers/config`);
  if (!response.ok) {
    throw new Error(`Trigger configs request failed with status ${response.status}`);
  }
  return response.json();
}

export async function executeManualPrediction(
  hazard: 'cyclone' | 'flood' | 'landslide' | 'tsunami',
  payload: any,
  role: string = 'CONTROL_ROOM_OPERATOR'
) {
  const response = await fetch(`${API_BASE_URL}/ai/${hazard}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': role,
      'X-User-Id': 'operator-dashboard-session',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Prediction request failed with status ${response.status}`);
  }
  return data;
}


// Alerts & Disaster Coordination Endpoints
export async function fetchActiveAlerts(district?: string) {
  const url = district ? `${API_BASE_URL}/alerts/active?district=${encodeURIComponent(district)}` : `${API_BASE_URL}/alerts/active`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch active alerts: ${response.status}`);
  }
  return response.json();
}

export async function fetchPendingAlerts(district?: string) {
  const url = district ? `${API_BASE_URL}/alerts/pending?district=${encodeURIComponent(district)}` : `${API_BASE_URL}/alerts/pending`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch pending alerts: ${response.status}`);
  }
  return response.json();
}

export async function approveDisasterAlert(id: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}/alerts/approve/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to approve alert: ${response.status}`);
  }
  return data;
}

export async function rejectDisasterAlert(id: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}/alerts/reject/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to reject alert: ${response.status}`);
  }
  return data;
}

export async function submitCitizenReport(payload: any) {
  const response = await fetch(`${API_BASE_URL}/incidents/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to submit report: ${response.status}`);
  }
  return data;
}

export async function fetchMyIncidentReports(phone?: string, citizenId?: string) {
  const params = new URLSearchParams();
  if (phone) params.append('phone', phone);
  if (citizenId) params.append('citizenId', citizenId);

  const response = await fetch(`${API_BASE_URL}/incidents/my-reports?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch citizen incident reports: ${response.status}`);
  }
  return response.json();
}

export async function fetchDistrictIncidents(district: string) {
  const response = await fetch(`${API_BASE_URL}/incidents/district/${encodeURIComponent(district)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch district incidents: ${response.status}`);
  }
  return response.json();
}

export async function respondToCitizenIncident(id: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}/incidents/${id}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to transmit authority response: ${response.status}`);
  }
  return data;
}
