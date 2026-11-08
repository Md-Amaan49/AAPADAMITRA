import { HealthCheckResponse } from '@aapadamitra/contracts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export async function fetchApiHealth(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check request failed with status ${response.status}`);
  }
  return response.json();
}

