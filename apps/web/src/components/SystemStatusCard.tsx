import React, { useEffect, useState } from 'react';
import { fetchApiHealth } from '../services/apiClient';
import { HealthCheckResponse } from '@aapadamitra/contracts';

export const SystemStatusCard: React.FC = () => {
  const [apiHealth, setApiHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApiHealth()
      .then((data) => {
        setApiHealth(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="status-grid">
      <div className="status-item">
        <div className="status-label">Frontend Status</div>
        <div className="status-value">
          <span className="status-tag">
            <span className="status-dot"></span>
            Operational (Vite / React)
          </span>
        </div>
      </div>
      <div className="status-item">
        <div className="status-label">Backend API Connection</div>
        <div className="status-value">
          {loading ? (
            <span style={{ color: '#64748b' }}>Checking /api/v1/health...</span>
          ) : error ? (
            <span style={{ color: '#eab308' }}>Standby (Service offline or unreached)</span>
          ) : (
            <span className="status-tag">
              <span className="status-dot"></span>
              {apiHealth?.service} ({apiHealth?.status})
            </span>
          )}
        </div>
      </div>
      <div className="status-item">
        <div className="status-label">Environment</div>
        <div className="status-value">Local Workspace</div>
      </div>
    </div>
  );
};

