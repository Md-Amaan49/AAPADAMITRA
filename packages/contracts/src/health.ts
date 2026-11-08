export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  timestamp?: string;
  version?: string;
}

