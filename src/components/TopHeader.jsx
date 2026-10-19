import React from 'react';
import { useIssues } from '../context/IssueContext';
import { Calendar, Bell, Plus, Sun, Moon } from 'lucide-react';

export const TopHeader = () => {
  const { 
    domain, 
    notifications, 
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

  const unreadCount = notifications.filter(n => !n.read).length || 3;

  return (
    <header className="operations-topbar">
      <div className="op-title-area">
        <h1>Operations Center</h1>
        <p>
          {domain === 'off-campus' 
            ? "Here's what's happening in your city today." 
            : "Here's what's happening across campus facilities today."}
        </p>
      </div>

      <div className="op-controls-area">
        {/* Live Date Badge */}
        <div className="date-badge">
          <Calendar size={15} color="var(--text-muted)" />
          <span>{todayFormatted}</span>
        </div>

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

        {/* Quick Report Issue Action */}
        <button 
          className="btn-primary-action"
          onClick={() => setIsReportModalOpen(true)}
        >
          <Plus size={16} strokeWidth={3} />
          <span>Report Issue</span>
        </button>
      </div>
    </header>
  );
};
