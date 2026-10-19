import React from 'react';
import { useIssues } from '../context/IssueContext';
import { 
  ClipboardList, Clock, Users, Zap, CheckCircle2, 
  ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

export const StatsRow = () => {
  const { issues } = useIssues();

  // Compute live metrics from database issues with realistic baseline
  const openCount = issues.filter(i => i.status !== 'resolved').length;
  const overdueCount = issues.filter(i => i.status === 'reported' && i.urgency === 'high').length;
  const unassignedCount = issues.filter(i => i.status !== 'resolved' && !i.assignedToUser).length;

  const displayOpen = (2120 + openCount).toLocaleString();
  const displayOverdue = (120 + overdueCount).toLocaleString();
  const displayUnassigned = (15 + unassignedCount).toLocaleString();

  return (
    <section className="stats-cards-row" aria-label="Key Performance Indicators">
      {/* 1. Open Issues */}
      <div className="stat-metric-card">
        <div className="stat-top-row">
          <div className="stat-icon-circle" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <ClipboardList size={17} />
          </div>
          <span className="stat-label-text">Open Issues</span>
        </div>
        <div className="stat-value-big">{displayOpen}</div>
        <div className="stat-trend-row" style={{ color: '#2563eb' }}>
          <ArrowUpRight size={14} />
          <span>8% vs. last week</span>
        </div>
      </div>

      {/* 2. Overdue */}
      <div className="stat-metric-card">
        <div className="stat-top-row">
          <div className="stat-icon-circle" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <Clock size={17} />
          </div>
          <span className="stat-label-text">Overdue</span>
        </div>
        <div className="stat-value-big">{displayOverdue}</div>
        <div className="stat-trend-row" style={{ color: '#dc2626' }}>
          <ArrowUpRight size={14} />
          <span>15% vs. last week</span>
        </div>
      </div>

      {/* 3. Unassigned */}
      <div className="stat-metric-card">
        <div className="stat-top-row">
          <div className="stat-icon-circle" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <Users size={17} />
          </div>
          <span className="stat-label-text">Unassigned</span>
        </div>
        <div className="stat-value-big">{displayUnassigned}</div>
        <div className="stat-trend-row" style={{ color: '#ea580c' }}>
          <ArrowUpRight size={14} />
          <span>20% vs. last week</span>
        </div>
      </div>

      {/* 4. Avg Response Time */}
      <div className="stat-metric-card">
        <div className="stat-top-row">
          <div className="stat-icon-circle" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Zap size={17} />
          </div>
          <span className="stat-label-text">Avg. Response Time</span>
        </div>
        <div className="stat-value-big">10h 24m</div>
        <div className="stat-trend-row" style={{ color: '#8b5cf6' }}>
          <ArrowDownRight size={14} />
          <span>5% vs. last week</span>
        </div>
      </div>

      {/* 5. Avg Resolution Time */}
      <div className="stat-metric-card">
        <div className="stat-top-row">
          <div className="stat-icon-circle" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={17} />
          </div>
          <span className="stat-label-text">Avg. Resolution Time</span>
        </div>
        <div className="stat-value-big">18h 42m</div>
        <div className="stat-trend-row" style={{ color: '#10b981' }}>
          <ArrowDownRight size={14} />
          <span>7% vs. last week</span>
        </div>
      </div>
    </section>
  );
};
