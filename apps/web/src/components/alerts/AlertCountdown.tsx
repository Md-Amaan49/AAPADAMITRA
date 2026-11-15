import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface AlertCountdownProps {
  onsetAt: string;
  expiresAt: string;
  createdAt?: string;
  onExpire?: () => void;
  compact?: boolean;
}

export const AlertCountdown: React.FC<AlertCountdownProps> = ({
  onsetAt,
  expiresAt,
  createdAt,
  onExpire,
  compact = false,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onsetMs = new Date(onsetAt).getTime();
  const expiresMs = new Date(expiresAt).getTime();

  const isPreOnset = now < onsetMs;
  const isExpired = now >= expiresMs;

  useEffect(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  const formatDiff = (diffMs: number) => {
    if (diffMs <= 0) return '00h 00m 00s';
    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatElapsed = (createdDateStr?: string) => {
    if (!createdDateStr) return '';
    const diffMin = Math.floor((now - new Date(createdDateStr).getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const hours = Math.floor(diffMin / 60);
    return `${hours}h ${diffMin % 60}m ago`;
  };

  if (isExpired) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
        <CheckCircle2 size={13} />
        <span>ALERT WINDOW EXPIRED / RECEDED</span>
      </div>
    );
  }

  if (isPreOnset) {
    const diff = onsetMs - now;
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fde68a',
        padding: compact ? '0.2rem 0.5rem' : '0.4rem 0.8rem',
        borderRadius: '6px',
        fontSize: compact ? '0.75rem' : '0.825rem',
        fontWeight: 600
      }}>
        <AlertTriangle size={15} color="#d97706" style={{ animation: 'pulse 1.5s infinite' }} />
        <span>DISASTER ONSET IN:</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: compact ? '0.8rem' : '0.9rem', color: '#b45309' }}>
          {formatDiff(diff)}
        </span>
        {createdAt && !compact && (
          <span style={{ color: '#78350f', fontSize: '0.75rem', marginLeft: '0.25rem', borderLeft: '1px solid #fcd34d', paddingLeft: '0.5rem' }}>
            Issued {formatElapsed(createdAt)}
          </span>
        )}
      </div>
    );
  }

  // Active Hazard State
  const remainingDiff = expiresMs - now;
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fca5a5',
      padding: compact ? '0.2rem 0.5rem' : '0.4rem 0.8rem',
      borderRadius: '6px',
      fontSize: compact ? '0.75rem' : '0.825rem',
      fontWeight: 600
    }}>
      <AlertOctagon size={15} color="#dc2626" style={{ animation: 'pulse 1s infinite' }} />
      <span>ACTIVE HAZARD ALERT:</span>
      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: compact ? '0.85rem' : '0.95rem', color: '#b91c1c' }}>
        {formatDiff(remainingDiff)} REMAINING
      </span>
      {createdAt && !compact && (
        <span style={{ color: '#7f1d1d', fontSize: '0.75rem', marginLeft: '0.25rem', borderLeft: '1px solid #f87171', paddingLeft: '0.5rem' }}>
          Live • Issued {formatElapsed(createdAt)}
        </span>
      )}
    </div>
  );
};
