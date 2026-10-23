import React from 'react';
import { ArrowRight, CheckCircle2, CircleDot, ClipboardCheck, FileVideo, Plus, ShieldCheck } from 'lucide-react';
import { useIssues } from '../context/IssueContext';
import './StudentDashboard.css';

const formatStatus = (status) => {
  if (status === 'in_progress') return 'In progress';
  if (status === 'resolved') return 'Resolved';
  return 'Open';
};

export const StudentDashboard = () => {
  const {
    currentUser,
    dashboardIssues: issues,
    domain,
    setCurrentView,
    setIsReportModalOpen,
    setSelectedIssue
  } = useIssues();

  const domainIssues = issues.filter((issue) => issue.domain === domain);
  const activeIssue = [...domainIssues]
    .filter((issue) => issue.status !== 'resolved')
    .sort((first, second) => new Date(second.reportedAt || 0) - new Date(first.reportedAt || 0))[0];
  const displayName = currentUser?.name?.trim().split(/\s+/)[0] || 'there';

  return (
    <section className="student-dashboard-content" aria-label="Student dashboard">
      <div className="student-welcome-card">
        <div className="student-welcome-copy">
          <span className="student-eyebrow">YOUR REPORTX SPACE</span>
          <h2>Welcome back, {displayName}</h2>
          <p>Report a {domain === 'off-campus' ? 'city' : 'campus'} issue and keep track of every update here.</p>
          <button className="student-report-button" onClick={() => setIsReportModalOpen(true)}>
            <Plus size={17} />
            Report an issue
          </button>
        </div>
        <div className="student-welcome-art" aria-hidden="true">
          <ClipboardCheck size={78} strokeWidth={1.3} />
        </div>
      </div>

      <div className="student-dashboard-panels">
        <section className="student-info-card student-active-card">
          <div className="student-card-heading">
            <div className="student-card-icon student-icon-blue"><CircleDot size={18} /></div>
            <div>
              <h3>{activeIssue ? 'Your latest active report' : 'Your report activity'}</h3>
              <p>{activeIssue ? 'Follow its progress with the maintenance team.' : 'Updates to your submitted reports will appear here.'}</p>
            </div>
          </div>
          {activeIssue ? (
            <button
              className="student-active-issue"
              onClick={() => setSelectedIssue(activeIssue)}
              aria-label={`View report ${activeIssue.title}`}
            >
              <span className="student-active-issue-copy">
                <strong>{activeIssue.title}</strong>
                <span>{activeIssue.location} · #{activeIssue.id}</span>
              </span>
              <span className={`student-status-pill student-status-${activeIssue.status === 'in_progress' ? 'progress' : 'open'}`}>
                {formatStatus(activeIssue.status)}
              </span>
              <ArrowRight className="student-active-arrow" size={17} />
            </button>
          ) : (
            <div className="student-empty-activity">
              <CheckCircle2 size={18} />
              <span>{domainIssues.length ? 'All your reports are resolved in this operation.' : `You have no ${domain === 'off-campus' ? 'city' : 'campus'} reports yet.`}</span>
            </div>
          )}
          <button className="student-text-link" onClick={() => setCurrentView('reports')}>
            View all my reports <ArrowRight size={15} />
          </button>
        </section>

        <section className="student-info-card student-guide-card">
          <div className="student-card-heading">
            <div className="student-card-icon student-icon-green"><ShieldCheck size={18} /></div>
            <div>
              <h3>What happens after you report?</h3>
              <p>A simple guide to the service process.</p>
            </div>
          </div>
          <ol className="student-steps">
            <li><span>1</span><div><strong>We review your report</strong><small>The team checks the details and evidence.</small></div></li>
            <li><span>2</span><div><strong>It is assigned to a team</strong><small>You can follow progress in My Reports.</small></div></li>
            <li><span>3</span><div><strong>Get notified when it is resolved</strong><small>Confirm the outcome from the report details.</small></div></li>
          </ol>
        </section>
      </div>

      <aside className="student-report-tip">
        <FileVideo size={19} />
        <div>
          <strong>Helpful tip for a faster review</strong>
          <span>Add a short video, describe what is wrong, and choose the closest location. A photo is optional.</span>
        </div>
      </aside>
    </section>
  );
};
