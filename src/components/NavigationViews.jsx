import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { CATEGORIES } from '../data/mockData';
import { LiveMapWidget } from './LiveMapWidget';
import { Download, Search, AlertTriangle, ArrowLeft } from 'lucide-react';

export const NavigationViews = () => {
  const { 
    currentView, setCurrentView, 
    dashboardIssues: issues, domain, role, setSelectedIssue,
    showToast 
  } = useIssues();

  const [searchFilter, setSearchFilter] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const relevantIssues = role === 'student'
    ? issues.filter((issue) => issue.domain === domain)
    : issues.filter(i => i.domain === domain);

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Domain', 'Category', 'Location', 'Status', 'Urgency', 'Upvotes', 'Assigned To'];
    const rows = relevantIssues.map(i => [
      i.id,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      i.domain || 'city',
      i.category || 'general',
      `"${(i.location || '').replace(/"/g, '""')}"`,
      i.status || 'open',
      i.urgency || 'medium',
      i.upvotes || 0,
      `"${(i.assignedTo || 'Unassigned').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fixly_operations_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Operations report exported to CSV', 'success');
  };

  // Back to overview button
  const BackButton = () => (
    <button 
      onClick={() => setCurrentView('overview')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.8rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
        marginBottom: '1rem'
      }}
    >
      <ArrowLeft size={14} /> Back to Overview
    </button>
  );

  // 1. FULL MAP VIEW
  if (currentView === 'map') {
    return (
      <div>
        <BackButton />
        <div className="dashboard-panel-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800 }}>
                Interactive City & Facilities Map
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Real-time geolocated incidents with live operational status
              </p>
            </div>
          </div>
          <LiveMapWidget onExpandMap={() => {}} />
        </div>
      </div>
    );
  }

  // 2. FULL REPORTS VIEW
  if (currentView === 'reports') {
    const filtered = relevantIssues.filter(i => {
      const matchSearch = !searchFilter || 
        i.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        i.location?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        i.id?.toLowerCase().includes(searchFilter.toLowerCase());
      const matchCat = catFilter === 'all' || i.category === catFilter;
      return matchSearch && matchCat;
    });

    return (
      <div>
        <BackButton />
        <div className="dashboard-panel-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800 }}>
                {role === 'student' ? 'My Reports' : 'Master Incident Reports Directory'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {role === 'student'
                  ? `Showing ${filtered.length} reports you submitted`
                  : `Showing ${filtered.length} total reports tracked across the network`}
              </p>
            </div>
            {role !== 'student' && (
              <button
                className="btn-primary-action"
                onClick={handleExportCSV}
              >
                <Download size={15} />
                <span>Export CSV Audit</span>
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search ticket ID, title, or location..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem'
                }}
              />
            </div>
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem'
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="table-responsive-container">
            <table className="data-table-modern">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Urgency</th>
                  <th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelectedIssue(item)}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>#{item.id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</td>
                    <td>{item.location}</td>
                    <td>{item.category}</td>
                    <td>
                      <span className={`badge-status badge-status-${item.status}`}>
                        {(item.status || 'open').replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-priority badge-priority-${item.urgency || 'medium'}`}>
                        {item.urgency || 'medium'}
                      </span>
                    </td>
                    <td style={{ color: item.assignedTo ? 'var(--text-primary)' : 'var(--text-dim)' }}>
                      {item.assignedTo || 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. WORK ORDERS VIEW
  if (currentView === 'work_orders') {
    const activeOrders = relevantIssues.filter(i => i.status !== 'resolved');

    return (
      <div>
        <BackButton />
        <div className="dashboard-panel-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Work Orders & Dispatch Center
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Manage active tasks, assign field technicians, and review repair completions
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {activeOrders.map(order => (
              <div 
                key={order.id} 
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.75rem',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>#{order.id}</span>
                    <span className={`badge-status badge-status-${order.status}`}>{(order.status || 'open').replace('_', ' ')}</span>
                  </div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{order.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {order.location}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {order.assignedTo ? `Worker: ${order.assignedTo}` : 'Needs Owner'}
                  </span>
                  <button 
                    className="btn-assign-dropdown"
                    onClick={() => setSelectedIssue(order)}
                  >
                    Manage Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. ALERTS VIEW
  if (currentView === 'alerts') {
    const alerts = relevantIssues.filter(i => i.urgency === 'high' || i.urgency === 'critical' || i.status === 'reported');

    return (
      <div>
        <BackButton />
        <div className="dashboard-panel-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem', color: '#dc2626' }}>
            Active Operational Alerts & Critical SLA
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Urgent city & campus infrastructure issues requiring priority resolution
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelectedIssue(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: '1px solid #fecaca',
                  borderRadius: '0.65rem',
                  background: '#fef2f2',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <AlertTriangle size={20} color="#dc2626" />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#991b1b' }}>{item.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>📍 {item.location} • #{item.id}</div>
                  </div>
                </div>
                <button 
                  className="btn-subcard btn-subcard-red"
                  onClick={e => { e.stopPropagation(); setSelectedIssue(item); }}
                >
                  Resolve Alert
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. ANALYTICS VIEW
  if (currentView === 'analytics') {
    const resolvedCount = relevantIssues.filter(issue => issue.status === 'resolved').length;
    const openCount = relevantIssues.filter(issue => issue.status === 'reported' || issue.status === 'open').length;
    const resolutionRate = relevantIssues.length
      ? Math.round((resolvedCount / relevantIssues.length) * 100)
      : 0;

    return (
      <div>
        <BackButton />
        <div className="dashboard-panel-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Operational Performance & SLA Analytics
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Current status of reports in your operations workspace
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL REPORTS</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: '#2563eb', marginTop: '0.35rem' }}>{relevantIssues.length}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Reports in this account's workspace</div>
            </div>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>OPEN REPORTS</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: '#ea580c', marginTop: '0.35rem' }}>{openCount}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Awaiting resolution</div>
            </div>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>RESOLUTION RATE</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.35rem' }}>{resolutionRate}%</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{resolvedCount} resolved report{resolvedCount === 1 ? '' : 's'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. TEAM / MEMBERS VIEW
  if (currentView === 'team' || currentView === 'members') {
    return (
      <div>
        <BackButton />
        <div className="dashboard-panel-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {currentView === 'team' ? 'Maintenance Dispatch Crew' : 'Citizen Reporters Leaderboard'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {currentView === 'team' ? 'Approved field specialists and technicians' : 'Active community members and service reward points'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1' }}>
              No directory records are available for this account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
