import React from 'react';
import { Header } from './components/Header';
import { SystemStatusCard } from './components/SystemStatusCard';
import { AiPredictionsDashboard } from './components/AiPredictionsDashboard';

export const App: React.FC = () => {
  return (
    <div className="container">
      <main className="hero-card">
        <Header />
        <div className="divider" />
        <p className="description">
          This is the AAPADAMITRA operational development dashboard. Backend microservices,
          geospatial database layer, and hosted multi-hazard AI inference integrations are
          active.
        </p>
        <SystemStatusCard />
        <AiPredictionsDashboard />
      </main>
      <footer className="footer-note">
        AAPADAMITRA Platform Foundation &bull; Multi-Hazard Decision Support System
      </footer>
    </div>
  );
};

export default App;

