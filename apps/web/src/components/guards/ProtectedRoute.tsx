import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#1d4ed8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Check if user has one of the allowed roles (support role aliases)
    const normalizedUserRole = user.role;
    const isAuthorized = allowedRoles.some((role) => {
      if (role === normalizedUserRole) return true;
      if (role === 'DISTRICT_AUTHORITY' && normalizedUserRole === 'ADMIN') return true;
      if (role === 'ADMIN' && normalizedUserRole === 'DISTRICT_AUTHORITY') return true;
      if (role === 'MONITORING_OPERATOR' && normalizedUserRole === 'CONTROL_ROOM_OPERATOR') return true;
      if (role === 'CONTROL_ROOM_OPERATOR' && normalizedUserRole === 'MONITORING_OPERATOR') return true;
      if (role === 'EMERGENCY_RESPONDER' && normalizedUserRole === 'FIELD_RESPONDER') return true;
      if (role === 'FIELD_RESPONDER' && normalizedUserRole === 'EMERGENCY_RESPONDER') return true;
      return false;
    });

    if (!isAuthorized) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};
