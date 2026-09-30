import React from 'react';
import { useIssues } from '../context/IssueContext';
import { 
  Building2, Home, Activity, ShieldCheck, Sparkles, Zap
} from 'lucide-react';

export const HeroBanner = () => {
  const { domain, issues, setIsReportModalOpen } = useIssues();

  // Filter issues based on current domain
  const domainIssues = issues.filter(i => i.domain === domain);
  const totalCount = domainIssues.length;
  const resolvedCount = domainIssues.filter(i => i.status === 'resolved').length;
  const inProgressCount = domainIssues.filter(i => i.status === 'in_progress').length;
  const reportedCount = domainIssues.filter(i => i.status === 'reported').length;

  const healthScore = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  return (
    <div className="hero-banner">
      <div className="hero-grid">
        {/* Left Column: Heading & Action */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{
              background: domain === 'on-campus' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: domain === 'on-campus' ? '#818cf8' : '#34d399',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              border: domain === 'on-campus' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              {domain === 'on-campus' ? <Building2 size={14} /> : <Home size={14} />}
              <span>{domain === 'on-campus' ? 'On-Campus Infrastructure' : 'Off-Campus & Household Maintenance'}</span>
            </span>

            <span style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Sparkles size={14} />
              <span>Live issue feed</span>
            </span>
          </div>

          <h1 className="hero-title">
            {domain === 'on-campus' ? (
              <>Smart Campus Issues <span className="gradient-text">Resolved Fast & Transparently</span></>
            ) : (
              <>Off-Campus & Household <span className="gradient-text">Verified Repairs Hub</span></>
            )}
          </h1>

          <p className="hero-sub">
            {domain === 'on-campus' 
              ? 'Report lab equipment faults, water leaks, or electrical issues. Track progress and support existing reports.'
              : 'Facing RO water purifier faults, geyser breakdowns, or household plumbing issues in your PG or rented flat? Connect directly with Local Verified Vendors with transparent SLA clocks.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="btn-primary" onClick={() => setIsReportModalOpen(true)}>
              <Zap size={18} />
              <span>Report An Issue</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} color="#10b981" />
              <span>AI Smart Duplicate Merge Enabled</span>
            </div>
          </div>
        </div>

        {/* Right Column: Health Index Gauge & Quick Cards */}
        <div className="health-gauge-box">
          <div className="gauge-header">
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                {domain === 'on-campus' ? 'Campus Health Score' : 'Household Maintenance Index'}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: healthScore > 75 ? '#34d399' : '#fbbf24' }}>
                  {healthScore}%
                </span>
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Operational</span>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#34d399', 
              padding: '0.6rem', 
              borderRadius: '50%',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Activity size={24} />
            </div>
          </div>

          <div className="gauge-bar-container">
            <div className="gauge-fill" style={{ width: `${healthScore}%` }}></div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa' }}>{reportedCount}</span>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Reported</p>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.2)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>{inProgressCount}</span>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>In Progress</p>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>{resolvedCount}</span>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Resolved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
