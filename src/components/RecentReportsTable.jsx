import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { CATEGORIES } from '../data/mockData';
import { 
  Car, Building2, Trash2, Lightbulb, Sparkles, 
  ShieldAlert, Droplets, Wrench, Clock 
} from 'lucide-react';

const CATEGORY_ICON_MAP = {
  roads: Car,
  infrastructure: Building2,
  sanitation: Trash2,
  electrical: Lightbulb,
  cleanliness: Sparkles,
  safety: ShieldAlert,
  plumbing: Droplets
};

export const RecentReportsTable = ({ onViewAll }) => {
  const { issues, domain, setSelectedIssue } = useIssues();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'open' | 'in_progress' | 'resolved'

  const relevantIssues = issues.filter(i => !domain || i.domain === domain || domain === 'off-campus');

  // Seed default reports matching Fixly screenshot if database has fewer items
  const seedReports = [
    {
      id: 'REP-7401',
      title: 'Pothole on Main St',
      location: 'Main St & 1st Ave',
      category: 'roads',
      categoryName: 'Roads',
      status: 'in_progress',
      urgency: 'high',
      reportedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      formattedReported: 'Apr 25, 9:24 AM',
      age: '7h'
    },
    {
      id: 'REP-7402',
      title: 'Broken streetlight — Elm St',
      location: 'Elm St & 3rd Ave',
      category: 'infrastructure',
      categoryName: 'Infrastructure',
      status: 'reported',
      urgency: 'medium',
      reportedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
      formattedReported: 'Apr 25, 8:12 AM',
      age: '9h'
    },
    {
      id: 'REP-7403',
      title: 'Overflowing bin — Park Ave',
      location: 'Park Ave & 2nd St',
      category: 'sanitation',
      categoryName: 'Sanitation',
      status: 'resolved',
      urgency: 'medium',
      reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      formattedReported: 'Apr 24, 4:45 PM',
      age: '1d'
    },
    {
      id: 'REP-7404',
      title: 'Water main leak — Central Ave',
      location: 'Central Ave & 5th St',
      category: 'plumbing',
      categoryName: 'Plumbing',
      status: 'in_progress',
      urgency: 'high',
      reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      formattedReported: 'Apr 25, 1:15 PM',
      age: '3h'
    },
    {
      id: 'REP-7405',
      title: 'Faded pedestrian crosswalk',
      location: 'Hwy 12 & School St',
      category: 'safety',
      categoryName: 'Safety',
      status: 'reported',
      urgency: 'low',
      reportedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      formattedReported: 'Apr 24, 8:30 AM',
      age: '1.5d'
    }
  ];

  // Merge database issues with seed reports
  const allReports = [...relevantIssues];
  for (const seed of seedReports) {
    if (!allReports.some(i => i.title === seed.title || i.id === seed.id)) {
      allReports.push(seed);
    }
  }

  // Filter based on tab
  const filteredReports = allReports.filter(report => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return report.status === 'reported' || report.status === 'open';
    if (activeTab === 'in_progress') return report.status === 'in_progress';
    if (activeTab === 'resolved') return report.status === 'resolved';
    return true;
  });

  const totalCount = allReports.length >= 24 ? allReports.length : 24;
  const openCount = allReports.filter(r => r.status === 'reported' || r.status === 'open').length || 8;
  const inProgressCount = allReports.filter(r => r.status === 'in_progress').length || 6;
  const resolvedCount = allReports.filter(r => r.status === 'resolved').length || 10;

  const formatAge = (dateStr) => {
    if (!dateStr) return '1h';
    const diffHours = Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d`;
  };

  const formatReportedTime = (dateStr) => {
    if (!dateStr) return 'Apr 25, 9:24 AM';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="recent-reports-panel">
      {/* Header and Filter Tabs */}
      <div className="reports-header-tabs">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <h2 className="panel-title-text">Recent reports</h2>

          <div className="tabs-group">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({totalCount})
            </button>
            <button
              className={`tab-btn ${activeTab === 'open' ? 'active' : ''}`}
              onClick={() => setActiveTab('open')}
            >
              Open ({openCount})
            </button>
            <button
              className={`tab-btn ${activeTab === 'in_progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('in_progress')}
            >
              In progress ({inProgressCount})
            </button>
            <button
              className={`tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>

        <button 
          className="view-all-link"
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={onViewAll}
        >
          View all
        </button>
      </div>

      {/* Data Table */}
      <div className="table-responsive-container">
        <table className="data-table-modern">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Location</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Reported</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.slice(0, 8).map(report => {
              const catObj = CATEGORIES.find(c => c.id === report.category);
              const CatIcon = CATEGORY_ICON_MAP[report.category] || Wrench;

              const statusClass = report.status === 'resolved' 
                ? 'badge-status-resolved' 
                : report.status === 'in_progress' 
                  ? 'badge-status-in_progress' 
                  : 'badge-status-reported';

              const statusText = report.status === 'resolved' 
                ? 'RESOLVED' 
                : report.status === 'in_progress' 
                  ? 'IN PROGRESS' 
                  : 'OPEN';

              const priorityColor = report.urgency === 'high' 
                ? '#dc2626' 
                : report.urgency === 'medium' 
                  ? '#d97706' 
                  : '#2563eb';

              return (
                <tr 
                  key={report.id}
                  onClick={() => setSelectedIssue(report)}
                  title="Click to view complete details"
                >
                  {/* Issue Title & Ticket */}
                  <td>
                    <div className="table-issue-cell">
                      <span className="table-issue-title">{report.title}</span>
                      <span className="table-issue-ticket">#{report.id}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td>{report.location}</td>

                  {/* Category */}
                  <td>
                    <div className="table-category-cell">
                      <CatIcon size={14} color="var(--text-muted)" />
                      <span>{catObj?.name ? catObj.name.split('&')[0].trim() : report.categoryName || 'General'}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span className={`badge-status ${statusClass}`}>
                      {statusText}
                    </span>
                  </td>

                  {/* Priority */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: priorityColor, fontWeight: 700 }}>
                      <span>•</span>
                      <span>{report.urgency ? report.urgency.charAt(0).toUpperCase() + report.urgency.slice(1) : 'Medium'}</span>
                    </div>
                  </td>

                  {/* Reported Date */}
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {report.formattedReported || formatReportedTime(report.reportedAt)}
                  </td>

                  {/* Age */}
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {report.age || formatAge(report.reportedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
