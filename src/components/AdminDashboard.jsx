import React, { useEffect, useEffectEvent, useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { CATEGORIES } from '../data/mockData';
import { CheckCircle2, Download, Layers, ClipboardCheck, Users, UserRoundCheck, ShieldAlert, MapPin } from 'lucide-react';
import { LiveMapWidget } from './LiveMapWidget';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const {
    issues, domain, setCurrentView, showToast,
    getStaffApplications, getTechnicians, getPendingIssueReviews,
    approveStaffApplication, assignIssue, reviewIssue
  } = useIssues();
  const [staffApplications, setStaffApplications] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState({});
  const [pendingReviews, setPendingReviews] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});

  const domainIssues = issues.filter(i => i.domain === domain);
  const domainReviews = pendingReviews.filter((issue) => issue.domain === domain);
  const approvedEmployees = technicians;
  const totalCount = domainIssues.length;
  const resolvedCount = domainIssues.filter(i => i.status === 'resolved').length;
  const inProgressCount = domainIssues.filter(i => i.status === 'in_progress').length;
  const reportedCount = domainIssues.filter(i => i.status === 'reported').length;

  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  const refreshDispatchData = async () => {
    try {
      const [applications, employees, reviews] = await Promise.all([
        getStaffApplications(domain), getTechnicians(domain), getPendingIssueReviews()
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
  }, [domain]);

  const handleApprove = async (userId) => {
    try {
      await approveStaffApplication(userId, domain);
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
      await assignIssue(issue.id, technicianId, domain);
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
      showToast(decision === 'genuine' ? 'Report verified as genuine.' : decision === 'rejected' ? 'Report rejected and reporter notified.' : 'Report reopened for human review.', 'success');
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
    <div id="maintenance-office-dashboard" className="admin-dashboard">
      <div className="glass-card admin-dashboard-shell">
        {/* Header & Export Button */}
        <div className="admin-hero">
          <div>
            <div className="admin-hero-title">
              <span className="admin-hero-icon"><ClipboardCheck size={21} /></span>
              <h2>
                {domain === 'off-campus' ? 'City Operations Admin' : 'Campus Operations Admin'}
              </h2>
              <span className="admin-role-badge">
                ADMIN
              </span>
            </div>
            <p className="admin-hero-copy">
              Review {domain === 'off-campus' ? 'city' : 'campus'} reports, approve {domain === 'off-campus' ? 'city' : 'campus'} employees, and dispatch verified work to the right team.
            </p>
          </div>

          <button className="btn-primary admin-export" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Export report</span>
          </button>
        </div>

        <section className="admin-city-map">
          <div className="admin-city-map-heading">
            <div>
              <h3><MapPin size={18} /> {domain === 'off-campus' ? 'City' : 'Campus'} operations map</h3>
              <p>Explore reports with shared GPS coordinates and open directions to their locations.</p>
            </div>
            <button className="admin-map-link" onClick={() => setCurrentView('map')}>Open full map</button>
          </div>
          <LiveMapWidget onExpandMap={() => setCurrentView('map')} />
        </section>

        <section className="admin-dispatch">
          <div className="admin-dispatch-heading">
            <div className="admin-dispatch-icon"><ClipboardCheck size={19} /></div>
            <div>
              <h3>Maintenance office dispatch</h3>
              <p>Review {domain === 'off-campus' ? 'city' : 'campus'} staff applications and route verified reports to the correct department.</p>
            </div>
          </div>

          <h4 className="admin-section-title staff-title"><Users size={16} /> Staff awaiting approval <span>{staffApplications.length}</span></h4>
          {staffApplications.length === 0 ? (
            <p className="admin-empty-state">No verified applications are waiting.</p>
          ) : (
            <div className="admin-staff-grid">
              {staffApplications.map((applicant) => (
                <div key={applicant.id} className="admin-staff-card">
                  <div style={{ minWidth: 0 }}>
                    <strong>{applicant.name}</strong>
                    <p className="admin-muted-text">{applicant.email}</p>
                    <span className="admin-staff-department">{departmentName(applicant.department)} · ID {applicant.collegeId}</span>
                  </div>
                  <button className="btn-primary admin-approve" onClick={() => handleApprove(applicant.id)}><UserRoundCheck size={15} /> Approve</button>
                </div>
              ))}
            </div>
          )}

          <h4 className="admin-section-title review-title"><ShieldAlert size={16} /> Reports needing review <span>{domainReviews.length}</span></h4>
          <p className="admin-section-description">Review reports the AI could not verify. Reports are not assigned until an admin approves them.</p>
          <div className="admin-review-list">
            {domainReviews.map((issue) => (
              <div key={issue.id} className={`admin-review-card${issue.beforeImageUrl ? ' has-image' : ''}`}>
                <div className="admin-review-content">
                  <div className="admin-review-title-row"><span className="admin-ticket-id">#{issue.id}</span><strong>{issue.title}</strong><span className="admin-review-status">Needs review</span></div>
                  <p className="admin-review-description">{issue.description}</p>
                  <p className="admin-review-meta">
                    <MapPin size={14} />
                    {issue.location} · {issue.domain} · {CATEGORIES.find((category) => category.id === issue.category)?.name || issue.category} · Reported by {issue.reportedBy}
                  </p>
                  {issue.aiAssessment && <p className="admin-ai-assessment">AI: {issue.aiAssessment.verdict} · {issue.aiAssessment.confidence}% confidence · {issue.aiAssessment.summary}</p>}
                  <div className="admin-evidence-links">
                    {issue.beforeImageUrl && <a href={issue.beforeImageUrl} target="_blank" rel="noreferrer">Open photo evidence</a>}
                    {issue.videoUrl && <a href={issue.videoUrl} target="_blank" rel="noreferrer">Open video evidence</a>}
                  </div>
                  {issue.videoUrl && <video className="admin-review-video" src={issue.videoUrl} controls playsInline aria-label={`Video evidence for ${issue.id}`} />}
                  <input
                    className="admin-rejection-reason"
                    aria-label={`Rejection reason for ${issue.id}`}
                    value={rejectionReasons[issue.id] || ''}
                    onChange={(event) => setRejectionReasons((previous) => ({ ...previous, [issue.id]: event.target.value }))}
                    placeholder="Reason required if rejecting"
                  />
                  <div className="admin-review-actions">
                    <button className="btn-primary admin-verify" onClick={() => handleReview(issue, 'genuine')}><CheckCircle2 size={16} /> Approve report</button>
                    <button className="btn-secondary admin-reject" onClick={() => handleReview(issue, 'rejected')}>Reject report</button>
                  </div>
                </div>
                {issue.beforeImageUrl && <img className="admin-review-image" src={issue.beforeImageUrl} alt="Submitted issue evidence" />}
              </div>
            ))}
            {domainReviews.length === 0 && <p className="admin-empty-state">No reports are waiting for review in this scope.</p>}
          </div>

          <h4 className="admin-section-title assignment-title"><Layers size={16} /> Verified reports ready for assignment</h4>
          <p className="admin-section-description">Choose an approved employee in the matching department to dispatch each report.</p>
          <div className="admin-assignment-list">
            {domainIssues.filter((issue) => issue.isGenuine === true && issue.status !== 'resolved').map((issue) => {
              const matchingTechnicians = technicians.filter((technician) => technician.department === 'general' || technician.department === issue.category);
              return (
                <div key={issue.id} className="admin-assignment-card">
                  <div className="admin-assignment-info">
                    <strong><span className="admin-ticket-id">#{issue.id}</span> {issue.title}</strong>
                    <p><MapPin size={14} /> {issue.location} <span>·</span> {issue.urgency} priority <span>·</span> {CATEGORIES.find((category) => category.id === issue.category)?.name || issue.category}</p>
                    {issue.assignedToUser && <span className="admin-assigned-label"><CheckCircle2 size={14} /> Assigned to {issue.assignedTo}</span>}
                    {issue.reviewSource === 'ai' && !issue.assignedToUser && <button className="btn-secondary admin-reopen" onClick={() => handleReview(issue, 'needs_review')}>Reopen AI review</button>}
                  </div>
                  <select
                    className="admin-employee-select"
                    value={selectedTechnicians[issue.id] || issue.assignedToUser || ''}
                    onChange={(event) => setSelectedTechnicians((previous) => ({ ...previous, [issue.id]: event.target.value }))}
                    disabled={matchingTechnicians.length === 0}
                  >
                    <option value="">{matchingTechnicians.length ? 'Select employee' : 'No approved specialist'}</option>
                    {matchingTechnicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.name} · {departmentName(technician.department)}</option>)}
                  </select>
                  <button className="btn-primary admin-assign" disabled={!selectedTechnicians[issue.id] && !issue.assignedToUser} onClick={() => handleAssign(issue)}>
                    {issue.assignedToUser ? 'Reassign' : 'Assign'}
                  </button>
                </div>
              );
            })}
            {domainIssues.filter((issue) => issue.isGenuine === true && issue.status !== 'resolved').length === 0 && <p className="admin-empty-state">No verified reports need assignment in this domain.</p>}
          </div>

          <h4 className="admin-section-title staff-title"><Users size={16} /> Approved employees <span>{approvedEmployees.length}</span></h4>
          <p className="admin-section-description">Employees available for report assignments. Department matching is enforced when assigning work.</p>
          {approvedEmployees.length > 0 ? (
            <div className="admin-staff-grid">
              {approvedEmployees.map((employee) => (
                <div key={employee.id} className="admin-staff-card">
                  <div style={{ minWidth: 0 }}>
                    <strong>{employee.name}</strong>
                    <p className="admin-muted-text">{employee.email}</p>
                    <span className="admin-staff-department">{departmentName(employee.department)}</span>
                  </div>
                  <span className="admin-employee-active">Active</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-empty-state">No approved employees yet. Create local demo employees using the setup instructions in DATABASE_EMAIL_SETUP.md.</p>
          )}
        </section>

        {/* 4 Metric KPI Cards */}
        <div className="admin-metrics">
          <div className="admin-metric">
            <span className="admin-metric-label">Total issues logged</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.4rem' }}>
              <span className="admin-metric-value">{totalCount}</span>
              <Layers size={21} className="metric-blue" />
            </div>
          </div>

          <div className="admin-metric">
            <span className="admin-metric-label">Resolution rate</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.4rem' }}>
              <span className="admin-metric-value metric-green-text">{resolutionRate}%</span>
              <CheckCircle2 size={21} className="metric-green" />
            </div>
          </div>

          <div className="admin-metric">
            <span className="admin-metric-label">Awaiting work</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.4rem' }}>
              <span className="admin-metric-value metric-amber-text">{reportedCount}</span>
              <Layers size={21} className="metric-amber" />
            </div>
          </div>

          <div className="admin-metric">
            <span className="admin-metric-label">In progress</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.4rem' }}>
              <span className="admin-metric-value metric-sky-text">{inProgressCount}</span>
              <Layers size={21} className="metric-sky" />
            </div>
          </div>
        </div>

        {/* Category Distribution Bar Charts */}
        <div className="admin-category-panel">
          <h3 className="admin-category-heading">
            Category Volume Breakdown
          </h3>

          <div className="admin-category-list">
            {CATEGORIES.map(cat => {
              const count = domainIssues.filter(i => i.category === cat.id).length;
              const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

              return (
                <div key={cat.id} className="admin-category-row">
                  <span className="admin-category-name">{cat.name}</span>
                  <div className="admin-category-track">
                    <div style={{ height: '100%', width: `${percent}%`, background: cat.color, borderRadius: '9999px', transition: 'width 0.8s ease' }}></div>
                  </div>
                  <span className="admin-category-count">{count} <small>({percent}%)</small></span>
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
