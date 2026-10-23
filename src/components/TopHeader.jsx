import React from 'react';
import { useIssues } from '../context/IssueContext';
import { Calendar, Bell, Plus, Sun, Moon } from 'lucide-react';

export const TopHeader = () => {
  const { 
    domain,
    role,
    notifications, 
    currentUser,
    openAuthModal,
    setIsReportModalOpen, 
    theme, 
    setTheme
  } = useIssues();

  // Dynamic formatted live date matching screenshot "Saturday, April 25"
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="operations-topbar">
      <div className="op-title-area">
        <h1>{role === 'admin'
          ? `${domain === 'off-campus' ? 'City' : 'Campus'} Operations Admin`
          : role === 'technician'
            ? `${domain === 'off-campus' ? 'City' : 'Campus'} Employee Work Orders`
            : `${domain === 'off-campus' ? 'City' : 'Campus'} Student Dashboard`}</h1>
        <p>
          {role === 'admin'
            ? 'Review reports, verify evidence, and assign approved issues to employees.'
            : role === 'technician'
              ? 'Work on reports assigned to you by the maintenance office.'
              : `Submit ${domain === 'off-campus' ? 'city' : 'campus'} reports and follow your progress from one place.`}
        </p>
      </div>

      <div className="op-controls-area">
        {/* Live Date Badge */}
        {role !== 'student' && (
          <div className="date-badge">
            <Calendar size={15} color="var(--text-muted)" />
            <span>{todayFormatted}</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          className="icon-action-btn"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Notification Bell with Badge */}
        {role !== 'student' && (
          <button
            className="icon-action-btn"
            aria-label="Notifications"
            title={`${unreadCount} notifications`}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="notif-badge-bubble">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Quick Report Issue Action */}
        <button
          className="btn-primary-action"
          onClick={() => {
            if (currentUser) setIsReportModalOpen(true);
            else openAuthModal('signin');
          }}
        >
          <Plus size={16} strokeWidth={3} />
          <span>Report Issue</span>
        </button>
      </div>
    </header>
  );
};
