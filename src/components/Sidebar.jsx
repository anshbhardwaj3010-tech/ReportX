import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { 
  MapPin, Building2, LayoutGrid, Map, FileText, Wrench, Bell,
  BarChart3, Users, UserCheck, Settings, ChevronDown, 
  LogOut, LogIn, Moon, Sun
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    currentView, setCurrentView, 
    currentUser, role, logout, 
    setIsAuthModalOpen, setIsSettingsOpen,
    theme, setTheme,
    domain, setDomain, showToast
  } = useIssues();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItemsOperations = role === 'technician'
    ? [{ id: 'work_orders', label: 'My Work Orders', icon: Wrench }]
    : role === 'student'
      ? [{ id: 'reports', label: 'My Reports', icon: FileText }]
    : [
        { id: 'map', label: 'Map', icon: Map },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'work_orders', label: 'Work Orders', icon: Wrench },
        { id: 'alerts', label: 'Alerts', icon: Bell }
      ];

  const navItemsManagement = role === 'admin' ? [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'members', label: 'Members', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] : role === 'technician' ? [
    { id: 'settings', label: 'Settings', icon: Settings }
  ] : [];

  const displayName = currentUser?.name || 'Guest';
  const displayRole = role === 'admin' ? 'Administrator' : role === 'technician' ? 'Field Technician' : 'Citizen Reporter';
  const userInitials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SK';

  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-badge">
          <MapPin size={20} />
        </div>
        <div className="brand-info">
          <h2>ReportX</h2>
          <p>{domain === 'off-campus' ? 'City Operations' : 'Campus Operations'}{role === 'student' ? ' · Student' : role === 'technician' ? ' · Employee' : ''}</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav">
        {/* Workspace */}
        <div className="nav-group-label">Workspace</div>
        <button
          className={`nav-item-btn ${currentView === 'overview' ? 'active' : ''}`}
          onClick={() => setCurrentView('overview')}
        >
          <LayoutGrid size={18} />
          <span>{role === 'admin' ? 'Admin Dashboard' : role === 'technician' ? 'Employee Dashboard' : 'Overview'}</span>
        </button>

        {/* Operations */}
        {(role === 'admin' || role === 'student') && (
          <>
            <div className="nav-group-label">Operations Scope</div>
            <div className="sidebar-scope-options" role="group" aria-label="Operations scope">
              <button
                type="button"
                className={`sidebar-scope-option${domain === 'off-campus' ? ' active' : ''}`}
                aria-pressed={domain === 'off-campus'}
                onClick={() => {
                  setDomain('off-campus');
                  showToast(role === 'admin' ? 'Switched to City Operations view' : 'Showing your City reports', 'info');
                }}
              >
                <MapPin size={16} />
                <span>City Operations</span>
              </button>
              <button
                type="button"
                className={`sidebar-scope-option${domain === 'on-campus' ? ' active' : ''}`}
                aria-pressed={domain === 'on-campus'}
                onClick={() => {
                  setDomain('on-campus');
                  showToast(role === 'admin' ? 'Switched to Campus Operations view' : 'Showing your Campus reports', 'info');
                }}
              >
                <Building2 size={16} />
                <span>Campus Operations</span>
              </button>
            </div>
          </>
        )}

        {navItemsOperations.length > 0 && <div className="nav-group-label">Operations</div>}
        {navItemsOperations.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Management */}
        {navItemsManagement.length > 0 && <div className="nav-group-label">Management</div>}
        {navItemsManagement.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (item.id === 'settings') {
                  setIsSettingsOpen(true);
                } else {
                  setCurrentView(item.id);
                }
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer User Card */}
      <div className="sidebar-footer" style={{ position: 'relative' }}>
        <div 
          className="user-profile-card"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        >
          <div className="user-avatar-pill">
            {userInitials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-meta-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div className="user-meta-role">
              {displayRole}
            </div>
          </div>
          <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>

        {/* User Dropdown Menu */}
        {isUserMenuOpen && (
          <div className="custom-dropdown-popover" style={{ bottom: '100%', top: 'auto', left: '0.85rem', right: '0.85rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.4rem 0.65rem', borderBottom: '1px solid var(--border-light)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Logged in as <strong>{displayName}</strong>
            </div>

            <button 
              className="dropdown-item"
              onClick={() => {
                setTheme(theme === 'light' ? 'dark' : 'light');
                setIsUserMenuOpen(false);
              }}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              <span>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</span>
            </button>

            <button 
              className="dropdown-item"
              onClick={() => {
                setIsSettingsOpen(true);
                setIsUserMenuOpen(false);
              }}
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>

            {currentUser ? (
              <button 
                className="dropdown-item"
                style={{ color: '#ef4444' }}
                onClick={() => {
                  logout();
                  setIsUserMenuOpen(false);
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            ) : (
              <button 
                className="dropdown-item"
                style={{ color: 'var(--primary)' }}
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsUserMenuOpen(false);
                }}
              >
                <LogIn size={15} />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
