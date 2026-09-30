import React, { useEffect, useEffectEvent, useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { CATEGORIES } from '../data/mockData';
import { CheckCircle2, Download, Layers } from 'lucide-react';

export const AdminDashboard = () => {
  const {
    issues, domain, showToast,
    getStaffApplications, getTechnicians, getPendingIssueReviews,
    approveStaffApplication, assignIssue, reviewIssue
  } = useIssues();
  const [staffApplications, setStaffApplications] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState({});
  const [pendingReviews, setPendingReviews] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});

  const domainIssues = issues.filter(i => i.domain === domain);
  const totalCount = domainIssues.length;
  const resolvedCount = domainIssues.filter(i => i.status === 'resolved').length;
  const inProgressCount = domainIssues.filter(i => i.status === 'in_progress').length;
  const reportedCount = domainIssues.filter(i => i.status === 'reported').length;

  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  const refreshDispatchData = async () => {
    try {
      const [applications, employees, reviews] = await Promise.all([
        getStaffApplications(), getTechnicians(), getPendingIssueReviews()
      ]);
      setStaffApplications(applications);
      setTechnicians(employees);
      setPendingReviews(reviews);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const refreshInitially = useEffectEvent(refreshDispatchData);

  useEffect(() => {
    const refreshTimer = window.setTimeout(refreshInitially, 0);
    return () => window.clearTimeout(refreshTimer);
  }, []);

  const handleApprove = async (userId) => {
    try {
      await approveStaffApplication(userId);
      showToast('Maintenance employee approved.', 'success');
      await refreshDispatchData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleAssign = async (issue) => {
    const technicianId = selectedTechnicians[issue.id] || issue.assignedToUser;
    if (!technicianId) return;
    try {
      await assignIssue(issue.id, technicianId);
      showToast(`Issue ${issue.id} assigned.`, 'success');
      await refreshDispatchData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleReview = async (issue, decision) => {
    const reason = rejectionReasons[issue.id] || '';
    if (decision === 'rejected' && !reason.trim()) {
      showToast('Add a reason before rejecting this report.', 'error');
      return;
    }
    try {
      await reviewIssue(issue.id, decision, reason);
      showToast(decision === 'genuine' ? 'Report verified as genuine.' : 'Report rejected and reporter notified.', 'success');
      await refreshDispatchData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Export CSV Digital Summary Report
  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Domain', 'Category', 'Location', 'Status', 'Urgency', 'Upvotes', 'Assigned To'];
    const rows = domainIssues.map(i => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.domain,
      i.category,
      `"${i.location}"`,
      i.status,
      i.urgency,
      i.upvotes,
      `"${i.assignedTo}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ReportX_Complaints_Report_${domain}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Digital CSV Report exported successfully!', 'success');
  };

  return (
    <div id="maintenance-office-dashboard" style={{ marginTop: '2.5rem', scrollMarginTop: '1rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        {/* Header & Export Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
                🏛️ Executive Admin & SLA Analytics Dashboard
              </h2>
              <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                EXECUTIVE DEAN VIEW
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Real-time Service Level Agreement (SLA) metrics, category breakdown, and exportable digital audit reports
            </p>
          </div>

          <button className="btn-primary" onClick={handleExportCSV} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            <Download size={16} />
            <span>Export CSV Audit Report</span>
          </button>
        </div>

        <section style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', background: 'rgba(15,23,42,0.5)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>Maintenance office dispatch</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>Review verified staff applications, approve employees, and route reports to the correct department.</p>

          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#a5b4fc', marginBottom: '0.6rem' }}>Staff awaiting approval ({staffApplications.length})</h4>
          {staffApplications.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>No verified applications are waiting.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.65rem', marginBottom: '1rem' }}>
              {staffApplications.map((applicant) => (
                <div key={applicant.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <strong>{applicant.name}</strong>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', overflowWrap: 'anywhere' }}>{applicant.email}</p>
                    <span style={{ color: '#34d399', fontSize: '0.75rem' }}>{departmentName(applicant.department)} · ID {applicant.collegeId}</span>
                  </div>
                  <button className="btn-primary" onClick={() => handleApprove(applicant.id)} style={{ padding: '0.5rem 0.75rem', flexShrink: 0 }}>Approve</button>
                </div>
              ))}
            </div>
          )}

          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#fbbf24', margin: '1.25rem 0 0.6rem' }}>Reports awaiting genuineness review ({pendingReviews.length})</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.65rem' }}>Check the description, reported location, category, and evidence before approving. Only genuine reports can be assigned or earn points.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
            {pendingReviews.map((issue) => (
              <div key={issue.id} style={{ display: 'grid', gridTemplateColumns: issue.beforeImageUrl ? 'minmax(0, 1fr) 110px' : '1fr', gap: '0.75rem', padding: '0.8rem', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '0.5rem' }}>
                <div style={{ minWidth: 0 }}>
                  <strong>#{issue.id} · {issue.title}</strong>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '0.25rem' }}>{issue.description}</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {issue.location} · {issue.domain} · {CATEGORIES.find((category) => category.id === issue.category)?.name || issue.category} · Reported by {issue.reportedBy}
                  </p>
                  {issue.beforeImageUrl && <a href={issue.beforeImageUrl} target="_blank" rel="noreferrer" style={{ color: '#93c5fd', fontSize: '0.75rem' }}>Open submitted evidence</a>}
                  <input
                    aria-label={`Rejection reason for ${issue.id}`}
                    value={rejectionReasons[issue.id] || ''}
                    onChange={(event) => setRejectionReasons((previous) => ({ ...previous, [issue.id]: event.target.value }))}
                    placeholder="Reason required if rejecting"
                    style={{ display: 'block', width: '100%', marginTop: '0.55rem', background: '#0f172a', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.4rem', padding: '0.55rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.55rem' }}>
                    <button className="btn-primary" onClick={() => handleReview(issue, 'genuine')} style={{ padding: '0.5rem 0.75rem', background: '#059669' }}>Mark genuine</button>
                    <button className="btn-secondary" onClick={() => handleReview(issue, 'rejected')} style={{ padding: '0.5rem 0.75rem' }}>Reject report</button>
                  </div>
                </div>
                {issue.beforeImageUrl && <img src={issue.beforeImageUrl} alt="Submitted issue evidence" style={{ width: '110px', height: '100px', objectFit: 'cover', borderRadius: '0.4rem' }} />}
              </div>
            ))}
            {pendingReviews.length === 0 && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No reports are waiting for review.</p>}
          </div>

          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#a5b4fc', margin: '1rem 0 0.6rem' }}>Reports requiring assignment</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {domainIssues.filter((issue) => issue.isGenuine === true && issue.status !== 'resolved').map((issue) => {
              const matchingTechnicians = technicians.filter((technician) => technician.department === 'general' || technician.department === issue.category);
              return (
                <div key={issue.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(190px, 250px) auto', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <strong>#{issue.id} · {issue.title}</strong>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{issue.location} · {issue.urgency} · {CATEGORIES.find((category) => category.id === issue.category)?.name || issue.category}</p>
                    {issue.assignedToUser && <span style={{ color: '#34d399', fontSize: '0.75rem' }}>Assigned to {issue.assignedTo}</span>}
                  </div>
                  <select
                    value={selectedTechnicians[issue.id] || issue.assignedToUser || ''}
                    onChange={(event) => setSelectedTechnicians((previous) => ({ ...previous, [issue.id]: event.target.value }))}
                    disabled={matchingTechnicians.length === 0}
                    style={{ width: '100%', minWidth: 0, background: '#0f172a', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.6rem' }}
                  >
                    <option value="">{matchingTechnicians.length ? 'Select employee' : 'No approved specialist'}</option>
                    {matchingTechnicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.name} · {departmentName(technician.department)}</option>)}
                  </select>
                  <button className="btn-primary" disabled={!selectedTechnicians[issue.id] && !issue.assignedToUser} onClick={() => handleAssign(issue)} style={{ padding: '0.6rem 0.8rem' }}>
                    {issue.assignedToUser ? 'Reassign' : 'Assign'}
                  </button>
                </div>
              );
            })}
            {domainIssues.filter((issue) => issue.isGenuine === true && issue.status !== 'resolved').length === 0 && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No verified reports need assignment in this domain.</p>}
          </div>
        </section>

        {/* 4 Metric KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Issues Logged</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: 'white' }}>{totalCount}</span>
              <Layers size={22} color="#818cf8" />
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Resolution Rate</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: '#34d399' }}>{resolutionRate}%</span>
              <CheckCircle2 size={22} color="#10b981" />
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Awaiting Work</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24' }}>{reportedCount}</span>
              <Layers size={22} color="#fbbf24" />
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>In Progress</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8' }}>{inProgressCount}</span>
              <Layers size={22} color="#38bdf8" />
            </div>
          </div>
        </div>

        {/* Category Distribution Bar Charts */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Category Volume Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {CATEGORIES.map(cat => {
              const count = domainIssues.filter(i => i.category === cat.id).length;
              const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

              return (
                <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 60px', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>{cat.name}</span>
                  <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: cat.color, borderRadius: '9999px', transition: 'width 0.8s ease' }}></div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textAlign: 'right' }}>{count} ({percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const departmentName = (department) => ({
  general: 'General maintenance',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  appliance: 'Appliances',
  'ro-water': 'RO / Water purifier',
  'it-wifi': 'IT / Network',
  cleanliness: 'Cleanliness',
  furniture: 'Furniture / Locks',
  safety: 'Safety / Security'
}[department] || department || 'Unspecified');
