import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { ON_CAMPUS_LOCATIONS, OFF_CAMPUS_LOCATIONS } from '../data/mockData';
import { MapPin, Building2, Home, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CampusHeatmap = () => {
  const { domain, issues, setSelectedIssue } = useIssues();
  const [selectedLocFilter, setSelectedLocFilter] = useState(null);

  const locationsList = domain === 'on-campus' ? ON_CAMPUS_LOCATIONS : OFF_CAMPUS_LOCATIONS;

  return (
    <div style={{ marginTop: '3rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={22} color="#f59e0b" />
              <span>{domain === 'on-campus' ? 'Interactive Campus Building Hotspot Map' : 'Off-Campus Student Housing & PG Map'}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Click any building or location pin to inspect active tickets and density status
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>
            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>🔴 High Hotspot (3+ Issues)</span>
            <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>🟡 Moderate (1-2 Issues)</span>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>🟢 Clear (0 Issues)</span>
          </div>
        </div>

        {/* Location Hotspot Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {locationsList.map(loc => {
            const locIssues = issues.filter(i => i.location === loc && i.domain === domain && i.status !== 'resolved');
            const issueCount = locIssues.length;

            const color = issueCount >= 3 ? '#ef4444' : issueCount >= 1 ? '#f59e0b' : '#10b981';

            return (
              <div
                key={loc}
                onClick={() => setSelectedLocFilter(selectedLocFilter === loc ? null : loc)}
                style={{
                  background: selectedLocFilter === loc ? `${color}20` : 'rgba(15, 23, 42, 0.7)',
                  border: selectedLocFilter === loc ? `2px solid ${color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {domain === 'on-campus' ? <Building2 size={18} color={color} /> : <Home size={18} color={color} />}
                  <span style={{
                    background: `${color}20`,
                    color,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    border: `1px solid ${color}40`
                  }}>
                    {issueCount} {issueCount === 1 ? 'Open Ticket' : 'Open Tickets'}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{loc}</h4>

                {/* Sub-list if selected */}
                {selectedLocFilter === loc && locIssues.length > 0 && (
                  <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.5rem' }}>
                    {locIssues.map(iss => (
                      <div 
                        key={iss.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedIssue(iss); }}
                        style={{ fontSize: '0.75rem', color: '#818cf8', padding: '0.25rem 0', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        #{iss.id} - {iss.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
