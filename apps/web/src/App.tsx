import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DistrictProvider } from './context/DistrictContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/guards/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { HazardsPage } from './pages/public/HazardsPage';
import { PreparednessPage } from './pages/public/PreparednessPage';
import { ContactPage } from './pages/public/ContactPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboards
import { AuthorityDashboard } from './pages/dashboard/AuthorityDashboard';
import { OperatorDashboard } from './pages/dashboard/OperatorDashboard';
import { ResponderDashboard } from './pages/dashboard/ResponderDashboard';
import { CitizenDashboard } from './pages/dashboard/CitizenDashboard';

// Error Pages
import { UnauthorizedPage } from './pages/errors/UnauthorizedPage';
import { ForbiddenPage } from './pages/errors/ForbiddenPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';

// Backwards compatibility legacy status page
import { Header } from './components/Header';
import { SystemStatusCard } from './components/SystemStatusCard';
import { AiPredictionsDashboard } from './components/AiPredictionsDashboard';

const PublicLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'DISTRICT_AUTHORITY':
    case 'ADMIN':
      return <Navigate to="/dashboard/authority" replace />;
    case 'MONITORING_OPERATOR':
    case 'CONTROL_ROOM_OPERATOR':
      return <Navigate to="/dashboard/operator" replace />;
    case 'EMERGENCY_RESPONDER':
    case 'FIELD_RESPONDER':
      return <Navigate to="/dashboard/responder" replace />;
    case 'CITIZEN':
    default:
      return <Navigate to="/dashboard/citizen" replace />;
  }
};

const LegacyStatusPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <main className="hero-card">
        <Header />
        <div className="divider" />
        <p className="description">
          AAPADAMITRA System Diagnostics &amp; Multi-Hazard Inference Health.
        </p>
        <SystemStatusCard />
        <AiPredictionsDashboard />
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DistrictProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Portal Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/hazards" element={<HazardsPage />} />
            <Route path="/preparedness" element={<PreparednessPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/status" element={<LegacyStatusPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Error Handlers */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
          </Route>

          {/* Protected Dashboard Route Dispatcher */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Role-Specific Dashboards */}
          <Route
            path="/dashboard/authority"
            element={
              <ProtectedRoute allowedRoles={['DISTRICT_AUTHORITY', 'ADMIN']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/operator"
            element={
              <ProtectedRoute allowedRoles={['MONITORING_OPERATOR', 'CONTROL_ROOM_OPERATOR', 'DISTRICT_AUTHORITY', 'ADMIN']}>
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/responder"
            element={
              <ProtectedRoute allowedRoles={['EMERGENCY_RESPONDER', 'FIELD_RESPONDER', 'DISTRICT_AUTHORITY', 'ADMIN']}>
                <ResponderDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/citizen"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN', 'DISTRICT_AUTHORITY', 'ADMIN']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DistrictProvider>
  </AuthProvider>
  );
};

export default App;
