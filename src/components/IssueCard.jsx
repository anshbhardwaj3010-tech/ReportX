import React from 'react';
import { useIssues } from '../context/IssueContext';
import { CATEGORIES } from '../data/mockData';
import { 
  Zap, Droplets, Flame, GlassWater, Wifi, Sparkles, Armchair, 
  ShieldAlert, ThumbsUp, MapPin, Clock, CheckCircle2, ChevronRight, User, AlertOctagon 
} from 'lucide-react';

const ICON_MAP = {
  Zap, Droplets, Flame, GlassWater, Wifi, Sparkles, Armchair, ShieldAlert
};

export const IssueCard = ({ issue }) => {
  const { upvoteIssue, setSelectedIssue, currentUser } = useIssues();
  const categoryObj = CATEGORIES.find(c => c.id === issue.category) || CATEGORIES[0];
  const IconComp = ICON_MAP[categoryObj.icon] || Zap;

  const isUpvoted = currentUser ? issue.upvotedUsers?.includes(currentUser.id) : false;

  // Status Badge Class
  const statusClass = `status-${issue.status}`;
  const statusLabel = issue.status === 'in_progress' ? 'In Progress' : issue.status.toUpperCase();

  return (
    <div 
      className="glass-card issue-card"
      onClick={() => setSelectedIssue(issue)}
      style={{ cursor: 'pointer' }}
    >
      <div>
        {/* Card Header */}
        <div className="card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#818cf8', fontFamily: 'var(--font-heading)' }}>
              #{issue.id}
            </span>
            <span className={`badge-tag ${statusClass}`}>
              {statusLabel}
            </span>
            {issue.isGenuine === null && <span className="badge-tag" style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.12)' }}>Pending office review</span>}
            {issue.isGenuine === true && <span className="badge-tag" style={{ color: '#34d399', background: 'rgba(16,185,129,0.12)' }}>Verified genuine</span>}
            {issue.isGenuine === false && <span className="badge-tag" style={{ color: '#f87171', background: 'rgba(239,68,68,0.12)' }}>Not verified</span>}
            {issue.urgency === 'emergency' && (
              <span className="badge-tag status-escalated" style={{ fontSize: '0.7rem' }}>
                <AlertOctagon size={12} /> Emergency
              </span>
            )}
          </div>

          {/* Category Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: `${categoryObj.color}15`,
            color: categoryObj.color,
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: '0.4rem',
            border: `1px solid ${categoryObj.color}30`
          }}>
            <IconComp size={13} />
            <span>{categoryObj.name}</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="card-title" style={{ marginTop: '0.75rem' }}>{issue.title}</h3>
        <p className="card-desc" style={{ marginTop: '0.4rem' }}>{issue.description}</p>

        {/* Location & Reported Info */}
        <div className="card-meta" style={{ marginTop: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#cbd5e1' }}>
            <MapPin size={14} color="#38bdf8" />
            <span style={{ fontWeight: 600 }}>{issue.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', marginTop: '0.3rem' }}>
            <User size={14} />
            <span>Reported by <strong style={{ color: '#e2e8f0' }}>{issue.reportedBy || 'Unknown user'}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="card-footer">
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <User size={13} />
          <span>Assigned: <strong style={{ color: '#e2e8f0' }}>{issue.assignedTo}</strong></span>
        </div>

        <button 
          className={`upvote-btn ${isUpvoted ? 'upvoted' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            upvoteIssue(issue.id);
          }}
        >
          <ThumbsUp size={14} />
          <span>{issue.upvotes}</span>
        </button>
      </div>
    </div>
  );
};
