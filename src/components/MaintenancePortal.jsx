import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { PhotoUpload } from './PhotoUpload';
import { Wrench, CheckCircle2, ShieldCheck } from 'lucide-react';

export const MaintenancePortal = () => {
  const { issues, updateIssueStatus, domain } = useIssues();
  const [techFilter, setTechFilter] = useState('all');
  const [activeProofIssue, setActiveProofIssue] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [isProofUploading, setIsProofUploading] = useState(false);

  const techIssues = issues.filter(i => {
    if (domain === 'on-campus' && i.domain !== 'on-campus') return false;
    if (domain === 'off-campus' && i.domain !== 'off-campus') return false;
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
    <div style={{ marginTop: '2rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
                {domain === 'on-campus' ? '🛠️ Campus Maintenance Staff Portal' : '🏡 Local Verified Vendor Work Orders'}
              </h2>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                ACTIVE RESOLVER PORTAL
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Manage assigned work orders, update stage status, and upload repair resolution photo proof
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'pending', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setTechFilter(f)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: techFilter === f ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: techFilter === f ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: techFilter === f ? '#34d399' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Work Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {techIssues.map(issue => (
            <div 
              key={issue.id}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#818cf8' }}>#{issue.id}</span>
                  <span className={`badge-tag status-${issue.status}`}>
                    {issue.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>{issue.location}</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{issue.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>{issue.description}</p>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                  Assigned To: <strong style={{ color: '#e2e8f0' }}>{issue.assignedTo}</strong>
                </span>
              </div>

              {/* Status Update Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {issue.status === 'reported' && (
                  <button 
                    className="btn-primary" 
                    onClick={() => updateIssueStatus(issue.id, 'in_progress', issue.assignedTo)}
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  >
                    <Wrench size={16} />
                    <span>Start Work (In Progress)</span>
                  </button>
                )}

                {issue.status === 'in_progress' && (
                  <button 
                    className="btn-primary" 
                    onClick={() => setActiveProofIssue(issue)}
                    style={{ background: '#10b981' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Complete & Upload Proof</span>
                  </button>
                )}

                {issue.status === 'resolved' && (
                  <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ShieldCheck size={18} /> Verified Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
          {techIssues.length === 0 && (
            <p style={{ padding: '1rem', color: '#94a3b8', textAlign: 'center' }}>No work orders are currently assigned to your account.</p>
          )}
        </div>
      </div>

      {/* Resolution Proof Upload Modal */}
      {activeProofIssue && (
        <div className="modal-overlay" onClick={() => setActiveProofIssue(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Upload Resolution Proof for #{activeProofIssue.id}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Technicians must attach a completion photo and work notes before closing a ticket.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>WORK RESOLUTION NOTES</label>
              <textarea 
                placeholder="Detail what was fixed or replaced (e.g. Changed burnt MCB breaker & tested socket voltage)..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '0.5rem',
                  padding: '0.65rem',
                  color: 'white',
                  marginTop: '0.3rem',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <PhotoUpload label="RESOLUTION PHOTO" value={proofUrl} onChange={setProofUrl} onUploadingChange={setIsProofUploading} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
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
