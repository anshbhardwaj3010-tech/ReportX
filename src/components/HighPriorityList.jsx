import React, { useState, useEffect } from 'react';
import { useIssues } from '../context/IssueContext';
import { 
  Car, Lightbulb, Sparkles, Trash2, ShieldAlert, Droplets, 
  Wrench, MoreHorizontal, UserCheck, Clock, Check
} from 'lucide-react';

const CATEGORY_ICON_MAP = {
  roads: { icon: Car, bg: '#fef2f2', color: '#dc2626' },
  electrical: { icon: Lightbulb, bg: '#fefce8', color: '#d97706' },
  cleanliness: { icon: Sparkles, bg: '#f5f3ff', color: '#7c3aed' },
  sanitation: { icon: Trash2, bg: '#ecfdf5', color: '#059669' },
  safety: { icon: ShieldAlert, bg: '#fef2f2', color: '#dc2626' },
  plumbing: { icon: Droplets, bg: '#eff6ff', color: '#2563eb' }
};

export const HighPriorityList = ({ onViewAll }) => {
  const { 
    dashboardIssues: issues, domain, role, setSelectedIssue,
    assignIssue, getTechnicians, showToast
  } = useIssues();

  const [technicians, setTechnicians] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  useEffect(() => {
    if (role !== 'admin') return;
    getTechnicians(domain)
      .then(setTechnicians)
      .catch(error => showToast(error.message, 'error'));
  }, [role, domain, getTechnicians, showToast]);

  // Filter issues for current domain, prioritize high/urgent/open issues
  const relevantIssues = issues.filter(i => i.domain === domain);
  
  // High priority issues list
  const highPriorityItems = relevantIssues.filter(i => 
    i.urgency === 'high' || i.urgency === 'critical' || i.status === 'in_progress' || i.status === 'reported'
  );

  const displayItems = highPriorityItems;

  const itemsToShow = displayItems.slice(0, 5);

  const handleAssignTechnician = async (issueId, tech) => {
    try {
      const issue = issues.find((item) => item.id === issueId);
      await assignIssue(issueId, tech.id, issue?.domain || domain);
      showToast(`Assigned ${tech.name} to ticket #${issueId}`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
    setActiveDropdownId(null);
  };

  return (
    <div className="dashboard-panel-card">
      {/* Header */}
      <div className="panel-header-row">
        <div className="panel-title-group">
          <h2 className="panel-title-text">High-priority issues</h2>
          <span className="pill-priority-filter">
            <span style={{ fontSize: '1rem', lineHeight: '0' }}>•</span> High
          </span>
        </div>
        <button 
          className="view-all-link"
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={onViewAll}
        >
          View all
        </button>
      </div>

      {/* Issues Rows */}
      <div className="priority-issues-list">
        {itemsToShow.length === 0 && (
          <p style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            No active reports need attention.
          </p>
        )}
        {itemsToShow.map(issue => {
          const catConfig = CATEGORY_ICON_MAP[issue.category] || {
            icon: Wrench, bg: '#f1f5f9', color: '#64748b'
          };
          const Icon = catConfig.icon;
          const locationText = issue.location || 'Location not provided';

          const priorityBadgeClass = issue.urgency === 'high' 
            ? 'badge-priority-high' 
            : issue.urgency === 'medium' 
              ? 'badge-priority-medium' 
              : 'badge-priority-low';

          const statusClass = issue.status === 'resolved' 
            ? 'badge-status-resolved' 
            : issue.status === 'in_progress' 
              ? 'badge-status-in_progress' 
              : 'badge-status-reported';

          const statusText = issue.status === 'resolved' 
            ? 'RESOLVED' 
            : issue.status === 'in_progress' 
              ? 'IN PROGRESS' 
              : 'OPEN';

          const timeLabel = issue.status === 'resolved' ? 'Resolved' : 'Active';

          return (
            <div key={issue.id} className="priority-issue-row">
              {/* Left Category Icon & Title */}
              <div className="issue-left-meta">
                <div 
                  className="issue-category-icon"
                  style={{ background: catConfig.bg, color: catConfig.color }}
                >
                  <Icon size={16} />
                </div>
                <div className="issue-info-block">
                  <div 
                    className="issue-title-strong"
                    onClick={() => setSelectedIssue(issue)}
                    title={issue.title}
                  >
                    {issue.title}
                  </div>
                  <div className="issue-coords-text">
                    {locationText}
                  </div>
                </div>
              </div>

              {/* Priority, SLA Timer, Status Badges */}
              <div className="issue-middle-pills">
                <span className={`badge-priority ${priorityBadgeClass}`}>
                  {issue.urgency === 'high' && '• '}
                  {issue.urgency ? issue.urgency.charAt(0).toUpperCase() + issue.urgency.slice(1) : 'Medium'}
                </span>

                <span className="sla-timer-pill">
                  <Clock size={12} />
                  <span>{timeLabel}</span>
                </span>

                <span className={`badge-status ${statusClass}`}>
                  {statusText}
                </span>
              </div>

              {/* Action Dropdown & More Options */}
              <div className="issue-actions-right">
                {role === 'admin' && <button
                  className="btn-assign-dropdown"
                  onClick={() => setActiveDropdownId(activeDropdownId === issue.id ? null : issue.id)}
                  aria-expanded={activeDropdownId === issue.id}
                  title="Assign maintenance worker"
                >
                  <UserCheck size={13} />
                  <span>{issue.assignedTo ? issue.assignedTo.split(' ')[0] : 'Assign'}</span>
                  <span style={{ fontSize: '0.65rem' }}>▼</span>
                </button>}

                {/* Technician Picker Popover */}
                {role === 'admin' && activeDropdownId === issue.id && (
                  <div className="custom-dropdown-popover" style={{ width: '210px' }}>
                    <div style={{ padding: '0.35rem 0.6rem', borderBottom: '1px solid var(--border-light)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                      ASSIGN DISPATCH CREW
                    </div>
                    {technicians.map(tech => (
                      <button
                        key={tech.id}
                        className="dropdown-item"
                        onClick={() => handleAssignTechnician(issue.id, tech)}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tech.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{tech.department || 'Maintenance'}</div>
                        </div>
                        {issue.assignedTo === tech.name && <Check size={14} color="#10b981" />}
                      </button>
                    ))}
                  </div>
                )}

                <button 
                  className="btn-more-options"
                  onClick={() => setSelectedIssue(issue)}
                  title="View issue details"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="list-pagination-footer">
        Showing {itemsToShow.length} of {displayItems.length} active reports
      </div>
    </div>
  );
};
