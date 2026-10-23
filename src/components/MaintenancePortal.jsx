import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { PhotoUpload } from './PhotoUpload';
import { LiveMapWidget } from './LiveMapWidget';
import { getDirectionsUrl, getIssueCoordinates } from '../utils/mapLocation';
import { Wrench, CheckCircle2, ShieldCheck, Navigation } from 'lucide-react';
import './MaintenancePortal.css';

export const MaintenancePortal = () => {
  const { issues, updateIssueStatus } = useIssues();
  const [techFilter, setTechFilter] = useState('all');
  const [activeProofIssue, setActiveProofIssue] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [isProofUploading, setIsProofUploading] = useState(false);

  const techIssues = issues.filter(i => {
    if (techFilter === 'pending' && i.status === 'resolved') return false;
    if (techFilter === 'resolved' && i.status !== 'resolved') return false;
    return true;
  });

  const handleResolve = (issue) => {
    updateIssueStatus(issue.id, 'resolved', issue.assignedTo, proofUrl, notesInput);
    setActiveProofIssue(null);
    setNotesInput('');
    setProofUrl('');
  };

  return (
    <div className="maintenance-portal">
      <LiveMapWidget />
      <div className="maintenance-panel">
        <div className="maintenance-header">
          <div>
            <div className="maintenance-title-row">
              <h2>My Assigned Work Orders</h2>
              <span className="maintenance-portal-badge">
                ACTIVE RESOLVER PORTAL
              </span>
            </div>
            <p className="maintenance-description">
              Work orders appear here after the maintenance office verifies the report and assigns it to you. Update progress and attach repair proof when complete.
            </p>
          </div>

          <div className="maintenance-filters" role="group" aria-label="Filter work orders">
            {['all', 'pending', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setTechFilter(f)}
                className={`maintenance-filter${techFilter === f ? ' is-active' : ''}`}
                aria-pressed={techFilter === f}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Work Orders List */}
        <div className="maintenance-orders-list">
          {techIssues.map(issue => (
            <article
              key={issue.id}
              className="maintenance-order-card"
            >
              <div className="maintenance-order-details">
                <div className="maintenance-order-meta">
                  <span className="maintenance-ticket">#{issue.id}</span>
                  <span className={`maintenance-status maintenance-status-${issue.status}`}>
                    {issue.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="maintenance-location">{issue.location}</span>
                </div>
                <h4 className="maintenance-order-title">{issue.title}</h4>
                <p className="maintenance-order-description">{issue.description}</p>
                <span className="maintenance-assignee">
                  Assigned To: <strong>{issue.assignedTo}</strong>
                </span>
              </div>

              {/* Status Update Actions */}
              <div className="maintenance-order-actions">
                {getDirectionsUrl(getIssueCoordinates(issue)) && (
                  <a
                    className="maintenance-action maintenance-action-directions"
                    href={getDirectionsUrl(getIssueCoordinates(issue))}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Get directions to ${issue.location}`}
                  >
                    <Navigation size={16} />
                    <span>Get directions</span>
                  </a>
                )}
                {issue.status === 'reported' && (
                  <button 
                    className="maintenance-action maintenance-action-start"
                    onClick={() => updateIssueStatus(issue.id, 'in_progress', issue.assignedTo)}
                  >
                    <Wrench size={16} />
                    <span>Start Work (In Progress)</span>
                  </button>
                )}

                {issue.status === 'in_progress' && (
                  <button 
                    className="maintenance-action maintenance-action-complete"
                    onClick={() => setActiveProofIssue(issue)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Complete & Upload Proof</span>
                  </button>
                )}

                {issue.status === 'resolved' && (
                  <span className="maintenance-resolved-label">
                    <ShieldCheck size={18} /> Verified Resolved
                  </span>
                )}
              </div>
            </article>
          ))}
          {techIssues.length === 0 && (
            <p className="maintenance-empty-state">No work orders are currently assigned to your account.</p>
          )}
        </div>
      </div>

      {/* Resolution Proof Upload Modal */}
      {activeProofIssue && (
        <div className="modal-overlay" onClick={() => setActiveProofIssue(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="maintenance-proof-title">
              Upload Resolution Proof for #{activeProofIssue.id}
            </h3>
            <p className="maintenance-proof-description">
              Technicians must attach a completion photo and work notes before closing a ticket.
            </p>

            <div className="maintenance-proof-notes">
              <label htmlFor="maintenance-resolution-notes">WORK RESOLUTION NOTES</label>
              <textarea 
                id="maintenance-resolution-notes"
                placeholder="Detail what was fixed or replaced (e.g. Changed burnt MCB breaker & tested socket voltage)..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                rows={3}
              />
            </div>

            <div className="maintenance-proof-upload">
              <PhotoUpload label="RESOLUTION PHOTO" value={proofUrl} onChange={setProofUrl} onUploadingChange={setIsProofUploading} />
            </div>

            <div className="maintenance-proof-actions">
              <button className="btn-secondary" onClick={() => setActiveProofIssue(null)}>Cancel</button>
              <button className="btn-primary" disabled={!proofUrl || isProofUploading || !notesInput.trim()} onClick={() => handleResolve(activeProofIssue)}>
                <ShieldCheck size={16} />
                <span>Mark Ticket Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
