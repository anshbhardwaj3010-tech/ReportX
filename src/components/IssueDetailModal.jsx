import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { getOptimizedImageUrl } from '../utils/cloudinary';
import { getDirectionsUrl, getIssueCoordinates } from '../utils/mapLocation';
import { 
  X, CheckCircle2, Clock, MapPin, Send, Star, ShieldCheck, Camera, Navigation
} from 'lucide-react';

export const IssueDetailModal = () => {
  const { 
    selectedIssue, setSelectedIssue, 
    addComment, verifyAndRateIssue, role
  } = useIssues();

  const [commentInput, setCommentInput] = useState('');
  const [starRating, setStarRating] = useState(5);

  if (!selectedIssue) return null;

  const stages = [
    { key: 'reported', label: '1. Issue Reported', desc: 'Ticket logged with location & media' },
    { key: 'acknowledged', label: selectedIssue.isGenuine === true ? '2. AI Verified' : selectedIssue.isGenuine === false ? '2. AI Flagged' : '2. AI Review Pending', desc: selectedIssue.isGenuine === true ? 'Ready for maintenance assignment' : selectedIssue.isGenuine === false ? 'Flagged for admin review' : 'Needs an evidence review' },
    { key: 'in_progress', label: '3. Work In Progress', desc: `Assigned: ${selectedIssue.assignedTo}` },
    { key: 'resolved', label: '4. Issue Resolved', desc: selectedIssue.resolvedAt || 'Verified repair completed' }
  ];

  // Determine stage progress index
  const getStageIndex = (status) => {
    if (status === 'reported') return 1;
    if (status === 'acknowledged') return 2;
    if (status === 'in_progress') return 2;
    if (status === 'resolved') return 3;
    return 0;
  };

  const currentStageIdx = getStageIndex(selectedIssue.status);
  const directionsUrl = getDirectionsUrl(getIssueCoordinates(selectedIssue));

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(selectedIssue.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#818cf8', fontFamily: 'var(--font-heading)' }}>
                #{selectedIssue.id}
              </span>
              <span className={`badge-tag status-${selectedIssue.status}`}>
                {selectedIssue.status.replace('_', ' ').toUpperCase()}
              </span>
              <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontWeight: 600 }}>
                {selectedIssue.domain === 'on-campus' ? 'On-Campus' : 'Off-Campus & Household'}
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800 }}>{selectedIssue.title}</h2>
          </div>
          <button 
            onClick={() => setSelectedIssue(null)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Location & Reported Info */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
            <MapPin size={16} color="#38bdf8" />
            <span><strong>Location:</strong> {selectedIssue.location}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Reported by: <strong style={{ color: '#e2e8f0' }}>{selectedIssue.reportedBy}</strong>
          </div>
          {directionsUrl && (role === 'admin' || role === 'technician') && (
            <a
              className="issue-directions-link"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation size={15} />
              Get directions
            </a>
          )}
        </div>

        {/* Real-time 4-Stage Progress Timeline */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Real-Time Resolution Stage Timeline
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', position: 'relative' }}>
            {stages.map((st, idx) => {
              const isPassed = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div 
                  key={st.key}
                  style={{
                    background: isCurrent ? 'rgba(99, 102, 241, 0.2)' : isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: isCurrent ? '2px solid #6366f1' : isPassed ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.5rem',
                    padding: '0.65rem',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem' }}>
                    {isPassed ? (
                      <CheckCircle2 size={18} color={isCurrent ? '#818cf8' : '#34d399'} />
                    ) : (
                      <Clock size={18} color="#64748b" />
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: isPassed ? 'white' : '#64748b' }}>{st.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description & Media Proof Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Issue Description & Evidence
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>{selectedIssue.description}</p>

          {/* Photo Comparison: Before vs After */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedIssue.afterImageUrl ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            {selectedIssue.beforeImageUrl && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <Camera size={14} /> Before Repair Photo
                </span>
                <img src={getOptimizedImageUrl(selectedIssue.beforeImageUrl, { width: 800 })} alt="Before repair" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
              </div>
            )}
            {selectedIssue.afterImageUrl && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <ShieldCheck size={14} /> After Repair Resolution Proof
                </span>
                <img src={getOptimizedImageUrl(selectedIssue.afterImageUrl, { width: 800 })} alt="After repair proof" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }} />
              </div>
            )}
          </div>
          {selectedIssue.videoUrl && (
            <video src={selectedIssue.videoUrl} controls playsInline aria-label="Submitted issue video evidence" style={{ display: 'block', width: '100%', maxHeight: '320px', marginTop: '1rem', borderRadius: '0.5rem', background: '#020617' }} />
          )}
        </div>

        {selectedIssue.aiAssessment && (
          <section aria-label="AI evidence screening result" style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', border: '1px solid rgba(129,140,248,0.3)', borderRadius: '0.5rem', background: 'rgba(99,102,241,0.08)' }}>
            <strong style={{ color: '#c7d2fe', fontSize: '0.85rem' }}>AI evidence screening</strong>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '0.3rem' }}>{selectedIssue.aiAssessment.summary}</p>
            {selectedIssue.aiAssessment.confidence > 0 && <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>{selectedIssue.aiAssessment.confidence}% model confidence. Screening is an estimate, not proof of authenticity.</p>}
          </section>
        )}

        {/* Student Verification & Rating (If Resolved and not verified yet) */}
        {selectedIssue.status === 'resolved' && !selectedIssue.studentVerified && (
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.2))', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={20} />
              Verify Fix & Rate Service Quality
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#a7f3d0', marginBottom: '0.85rem' }}>
              Technician has marked this repair complete. Please rate the service quality to verify ticket closure:
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setStarRating(star)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                >
                  <Star size={24} color={star <= starRating ? '#fbbf24' : '#475569'} fill={star <= starRating ? '#fbbf24' : 'none'} />
                </button>
              ))}
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginLeft: '0.5rem' }}>{starRating} Stars</span>
            </div>

            <button
              onClick={() => verifyAndRateIssue(selectedIssue.id, starRating)}
              className="btn-primary"
              style={{ background: '#10b981', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)' }}
            >
              <CheckCircle2 size={16} />
              <span>Confirm Verified Fix</span>
            </button>
          </div>
        )}

        {/* Activity & Comment Thread */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
            Live Activity & Updates Log
          </h4>

          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {selectedIssue.activityLog?.map(act => (
              <div key={act.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <p>{act.text}</p>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(act.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text"
              placeholder="Ask for status update or leave a note..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '0.5rem',
                padding: '0.6rem 0.85rem',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
