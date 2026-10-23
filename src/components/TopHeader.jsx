import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { Calendar, Bell, Plus, Sun, Moon } from 'lucide-react';

export const TopHeader = () => {
  const { 
    domain,
    role,
    notifications, 
    notificationError,
    markNotificationsRead,
    currentUser,
    openAuthModal,
    setIsReportModalOpen, 
    theme, 
    setTheme
  } = useIssues();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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
        <div className="notification-menu">
          <button
            className="icon-action-btn"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            title={`${unreadCount} unread notifications`}
            onClick={() => {
              const opening = !notificationsOpen;
              setNotificationsOpen(opening);
              if (opening && unreadCount) markNotificationsRead();
            }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="notif-badge-bubble">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="notification-popover" role="region" aria-label="Recent notifications">
              <strong>Recent notifications</strong>
              {notificationError ? (
                <p className="notification-error" role="alert">{notificationError}</p>
              ) : notifications.length ? notifications.map((notification) => (
                <div className="notification-item" key={notification.id}>
                  <span>{notification.text}</span>
                  <time>{new Date(notification.timestamp).toLocaleString()}</time>
                </div>
              )) : <p className="notification-empty">No updates yet.</p>}
            </div>
          )}
        </div>

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
