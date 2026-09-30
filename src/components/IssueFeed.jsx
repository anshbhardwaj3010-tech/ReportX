import React from 'react';
import { useIssues } from '../context/IssueContext';
import { IssueCard } from './IssueCard';
import { CATEGORIES } from '../data/mockData';
import { Filter, Layers, CheckCircle2, Clock, AlertTriangle, Sparkles } from 'lucide-react';

export const IssueFeed = () => {
  const { 
    issues, domain, searchQuery, 
    categoryFilter, setCategoryFilter, 
    statusFilter, setStatusFilter 
  } = useIssues();

  // Filter pipeline
  const filteredIssues = issues.filter(issue => {
    // Domain filter
    if (issue.domain !== domain) return false;

    // Status filter
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = issue.id.toLowerCase().includes(q);
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchLoc = issue.location.toLowerCase().includes(q);
      return matchId || matchTitle || matchDesc || matchLoc;
    }

    return true;
  });

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Feed Filter Header */}
      <div className="feed-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={22} color="#818cf8" />
            <span>{domain === 'on-campus' ? 'On-Campus Issue Stream' : 'Off-Campus & Household Stream'}</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>({filteredIssues.length} Tickets)</span>
          </h2>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status Tabs */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.2rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '0.2rem' }}>
            {[
              { id: 'all', label: 'All Status' },
              { id: 'reported', label: 'Reported' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.4rem',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === tab.id ? 'var(--primary)' : 'transparent',
                  color: statusFilter === tab.id ? 'white' : '#94a3b8'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.35rem 0.75rem', borderRadius: '0.5rem' }}>
            <Filter size={14} color="#64748b" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredIssues.length > 0 ? (
        <div className="issue-grid">
          {filteredIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Sparkles size={48} color="#64748b" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>No issues found matching your filters</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Try changing your category or status filters, or search term.
          </p>
        </div>
      )}
    </div>
  );
};
