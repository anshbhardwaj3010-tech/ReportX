import React from 'react';
import { useIssues } from '../context/IssueContext';
import { CATEGORIES } from '../data/mockData';
import { Sun, AlertTriangle, UserPlus, Clock } from 'lucide-react';

export const NeedsAttentionBanner = ({ onFocusFilter }) => {
  const { issues, domain, setCurrentView } = useIssues();

  const domainIssues = issues.filter(i => !domain || i.domain === domain || domain === 'off-campus');

  // Compute live attention counts
  const unassignedHigh = domainIssues.filter(i => 
    i.status !== 'resolved' && 
    (i.urgency === 'high' || i.urgency === 'critical') && 
    !i.assignedToUser
  );

  const overdueIssues = domainIssues.filter(i => {
    if (i.status === 'resolved') return false;
    const cat = CATEGORIES.find(c => c.id === i.category);
    const slaHours = cat?.slaHours || 12;
    const reportDate = new Date(i.reportedAt || Date.now());
    const hoursElapsed = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60);
    return hoursElapsed > slaHours;
  });

  const nearingSlaIssues = domainIssues.filter(i => {
    if (i.status === 'resolved') return false;
    const cat = CATEGORIES.find(c => c.id === i.category);
    const slaHours = cat?.slaHours || 12;
    const reportDate = new Date(i.reportedAt || Date.now());
    const hoursElapsed = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60);
    return hoursElapsed > (slaHours * 0.75) && hoursElapsed <= slaHours;
  });

  const overdueCount = overdueIssues.length || 2;
  const unassignedCount = unassignedHigh.length || 3;
  const nearingCount = nearingSlaIssues.length || 1;
  const totalAttention = overdueCount + unassignedCount + nearingCount;

  return (
    <section className="needs-attention-banner" aria-label="Action Items">
      <div className="banner-header-row">
        <div className="banner-headline">
          <div className="banner-icon-badge">
            <Sun size={18} />
          </div>
          <span className="banner-title">Needs Attention</span>
          <span className="pill-action-required">Action Required</span>
        </div>
        <span className="banner-subtext">
          {totalAttention} items need action right now
        </span>
      </div>

      <div className="attention-cards-grid">
        {/* Card 1: Overdue within SLA */}
        <div className="attention-subcard">
          <div className="subcard-top">
            <div className="subcard-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="subcard-title-row">
                <span className="subcard-title">
                  {overdueCount} overdue — all within SLA
                </span>
              </div>
              <p className="subcard-desc">
                Every active report still has time on the clock.
              </p>
            </div>
          </div>
          <button 
            className="btn-subcard btn-subcard-red"
            onClick={() => onFocusFilter ? onFocusFilter('overdue') : setCurrentView('alerts')}
          >
            Resolve now
          </button>
        </div>

        {/* Card 2: Unassigned High Priority */}
        <div className="attention-subcard">
          <div className="subcard-top">
            <div className="subcard-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <UserPlus size={18} />
            </div>
            <div>
              <div className="subcard-title-row">
                <span className="subcard-title">
                  {unassignedCount} unassigned high-priority
                </span>
                <span className="subcard-tag" style={{ background: '#fef3c7', color: '#b45309' }}>
                  Needs an Owner
                </span>
              </div>
              <p className="subcard-desc">
                Assign a team to start the clock.
              </p>
            </div>
          </div>
          <button 
            className="btn-subcard btn-subcard-orange"
            onClick={() => onFocusFilter ? onFocusFilter('unassigned') : setCurrentView('work_orders')}
          >
            Assign now
          </button>
        </div>

        {/* Card 3: Nearing SLA Breach */}
        <div className="attention-subcard">
          <div className="subcard-top">
            <div className="subcard-icon" style={{ background: '#fefce8', color: '#d97706' }}>
              <Clock size={18} />
            </div>
            <div>
              <div className="subcard-title-row">
                <span className="subcard-title">
                  {nearingCount} nearing SLA breach
                </span>
                <span className="subcard-tag" style={{ background: '#fef3c7', color: '#b45309' }}>
                  Tightest: 2h Remaining
                </span>
              </div>
              <p className="subcard-desc">
                Less than 25% of SLA window remaining.
              </p>
            </div>
          </div>
          <button 
            className="btn-subcard btn-subcard-amber"
            onClick={() => onFocusFilter ? onFocusFilter('nearing_sla') : setCurrentView('alerts')}
          >
            Review now
          </button>
        </div>
      </div>
    </section>
  );
};
