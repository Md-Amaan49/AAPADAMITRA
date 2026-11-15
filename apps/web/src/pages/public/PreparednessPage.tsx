import React from 'react';
import { 
  ShieldCheck, 
  PackageCheck, 
  Waves, 
  Wind 
} from 'lucide-react';

export const PreparednessPage: React.FC = () => {
  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
          <ShieldCheck size={16} />
          <span>Statutory Preparedness Protocols</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>
          Citizen Safety &amp; Emergency Preparedness Guides
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '850px', marginTop: '0.5rem' }}>
          Standard Operating Procedures (SOPs) based on guidelines issued by the National Disaster Management Authority (NDMA) and Maharashtra State Disaster Management Authority (SDMA).
        </p>
      </div>

      {/* Emergency Kit Checklist Banner */}
      <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <PackageCheck size={26} color="#16a34a" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
            Emergency Go-Bag &bull; 72-Hour Family Survival Kit
          </h2>
        </div>
        <p style={{ color: '#14532d', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Keep an emergency bag ready at an accessible location near your exit. In the event of an evacuation order from the District Collectorate, carry this kit immediately.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: '#166534' }}>
          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #dcfce7' }}>
            <strong>1. Vital Documents:</strong> Aadhaar, property papers, ration card, medical records in a waterproof sealed folder.
          </div>
          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #dcfce7' }}>
            <strong>2. Sustenance:</strong> 3 litres of drinking water per person/day, non-perishable dry rations (biscuits, dates, ORS).
          </div>
          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #dcfce7' }}>
            <strong>3. Medical Supplies:</strong> Prescription medications (7-day supply), antiseptic, bandages, paracetamol.
          </div>
          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #dcfce7' }}>
            <strong>4. Tools &amp; Light:</strong> LED torch with spare batteries, power bank, whistle (to signal rescuers), manual radio.
          </div>
        </div>
      </div>

      {/* Specific Hazard Protocols */}
      <div className="grid-2">
        {/* Flood Protocol */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Waves size={22} color="#1d4ed8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Flood &amp; Dam Discharge Protocol</h3>
          </div>
          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#334155' }}>
            <div style={{ borderLeft: '3px solid #1d4ed8', paddingLeft: '0.75rem' }}>
              <strong>Before Discharge:</strong> If residing downstream of Vishnupuri Dam along the Godavari river bank, monitor official sirens and SMS alerts. Move livestock to elevated ground.
            </div>
            <div style={{ borderLeft: '3px solid #eab308', paddingLeft: '0.75rem' }}>
              <strong>During Inundation:</strong> Switch off main electrical supply and gas cylinders. Never walk or drive through moving flood waters — 15 cm of moving water can knock an adult down.
            </div>
            <div style={{ borderLeft: '3px solid #16a34a', paddingLeft: '0.75rem' }}>
              <strong>Evacuation Order:</strong> Follow designated evacuation routes immediately towards declared DDMA relief shelters.
            </div>
          </div>
        </div>

        {/* Cyclone Protocol */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Wind size={22} color="#0891b2" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Cyclone &amp; Gale Winds Protocol</h3>
          </div>
          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#334155' }}>
            <div style={{ borderLeft: '3px solid #0891b2', paddingLeft: '0.75rem' }}>
              <strong>Securing Premises:</strong> Board up or tape windows, trim overhanging tree branches, and bring all loose outdoor objects indoors.
            </div>
            <div style={{ borderLeft: '3px solid #eab308', paddingLeft: '0.75rem' }}>
              <strong>Eye of the Storm:</strong> Do not step outside when the wind suddenly dies down; the reverse side of the eye wall will strike with equal or greater intensity.
            </div>
            <div style={{ borderLeft: '3px solid #16a34a', paddingLeft: '0.75rem' }}>
              <strong>Communication:</strong> Keep mobile phones charged and conserve battery by using text messages instead of voice calls.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
