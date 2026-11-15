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
