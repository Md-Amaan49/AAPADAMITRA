import React from 'react';
import { Header } from './components/Header';
import { SystemStatusCard } from './components/SystemStatusCard';

export const App: React.FC = () => {
  return (
    <div className="container">
      <main className="hero-card">
        <Header />
        <div className="divider" />
        <p className="description">
          This is only a development placeholder, not the final product UI. The monorepo
          foundation, modular backend architecture, contracts, and AI services are being
          initialized under Milestone 01.
        </p>
        <SystemStatusCard />
      </main>
      <footer className="footer-note">
        AAPADAMITRA Platform Foundation &bull; Windows 10 Development Environment
      </footer>
    </div>
  );
};

export default App;

