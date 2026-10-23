import React from 'react';
import { useIssues } from '../context/IssueContext';
import { ClipboardList, Clock, Users, Zap, CheckCircle2, Award } from 'lucide-react';

export const StatsRow = () => {
  const { dashboardIssues: allIssues, role, currentUser, domain } = useIssues();
  const issues = role === 'student' ? allIssues.filter((issue) => issue.domain === domain) : allIssues;

  const openCount = issues.filter(i => i.status === 'reported' || i.status === 'open').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const unassignedCount = issues.filter(i => i.status !== 'resolved' && !i.assignedToUser).length;

  if (role === 'student') {
    const studentStats = [
      { label: 'My Reports', value: issues.length, Icon: ClipboardList, color: '#2563eb', background: '#eff6ff' },
      { label: 'Open', value: openCount, Icon: Clock, color: '#dc2626', background: '#fef2f2' },
      { label: 'In Progress', value: inProgressCount, Icon: Users, color: '#ea580c', background: '#fff7ed' },
      { label: 'Resolved', value: resolvedCount, Icon: CheckCircle2, color: '#10b981', background: '#ecfdf5' },
      { label: 'Reward Points', value: currentUser?.rewardPoints || 0, Icon: Award, color: '#7c3aed', background: '#f5f3ff' }
    ];

    return (
      <section className="stats-cards-row student-stats-row" aria-label="Your report summary">
        {studentStats.map(({ label, value, Icon, color, background }) => (
          <div className="stat-metric-card" key={label}>
            <div className="stat-top-row">
              <div className="stat-icon-circle" style={{ background, color }}>
                <Icon size={17} />
              </div>
              <span className="stat-label-text">{label}</span>
            </div>
            <div className="stat-value-big">{value.toLocaleString()}</div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="stats-cards-row" aria-label="Key Performance Indicators">
      {/* 1. Open Issues */}
      <div className="stat-metric-card">
        <div className="stat-top-row">
          <div className="stat-icon-circle" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <ClipboardList size={17} />
          </div>
          <span className="stat-label-text">Total Reports</span>
        </div>
        <div className="stat-value-big">{issues.length.toLocaleString()}</div>
      </div>

      {/* 2. Overdue */}
      <div className="stat-metric-card">
        <div className="stat-top-row">
          <div className="stat-icon-circle" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <Clock size={17} />
          </div>
          <span className="stat-label-text">Open</span>
        </div>
        <div className="stat-value-big">{openCount.toLocaleString()}</div>
      </div>

      {/* 3. Unassigned */}
      <div className="stat-metric-card">
        <div className="stat-top-row">
          <div className="stat-icon-circle" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <Users size={17} />
          </div>
          <span className="stat-label-text">In Progress</span>
        </div>
        <div className="stat-value-big">{inProgressCount.toLocaleString()}</div>
      </div>

      {/* 4. Avg Response Time */}
      <div className="stat-metric-card">
        <div className="stat-top-row">
          <div className="stat-icon-circle" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Zap size={17} />
          </div>
          <span className="stat-label-text">Unassigned</span>
        </div>
        <div className="stat-value-big">{unassignedCount.toLocaleString()}</div>
      </div>

      {/* 5. Avg Resolution Time */}
      <div className="stat-metric-card">
        <div className="stat-top-row">
          <div className="stat-icon-circle" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={17} />
          </div>
          <span className="stat-label-text">Resolved</span>
        </div>
        <div className="stat-value-big">{resolvedCount.toLocaleString()}</div>
      </div>
    </section>
  );
};
