import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { 
  MapPin, LayoutGrid, Map, FileText, Wrench, Bell, 
  BarChart3, Users, UserCheck, Settings, ChevronDown, 
  LogOut, LogIn, Moon, Sun, Sparkles, Cloud 
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    currentView, setCurrentView, 
    currentUser, role, logout, 
    setIsAuthModalOpen, setIsSettingsOpen,
    theme, setTheme,
    domain, setDomain,
    cloudinaryStatus
  } = useIssues();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItemsWorkspace = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid }
  ];

  const navItemsOperations = [
    { id: 'map', label: 'Map', icon: Map },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'work_orders', label: 'Work Orders', icon: Wrench },
    { id: 'alerts', label: 'Alerts', icon: Bell }
  ];

  const navItemsManagement = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'members', label: 'Members', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const displayName = currentUser?.name || 'Sarah Khan';
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
          <h2>Fixly</h2>
          <p>{domain === 'off-campus' ? 'City Dashboard' : 'Campus Operations'}</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav">
        {/* Workspace */}
        <div className="nav-group-label">Workspace</div>
        {navItemsWorkspace.map(item => {
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

        {/* Operations */}
        <div className="nav-group-label">Operations</div>
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
        <div className="nav-group-label">Management</div>
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

      {/* Cloudinary Status Indicator */}
      <div style={{ padding: '0.5rem 1.15rem' }}>
        <div 
          onClick={() => setIsSettingsOpen(true)}
          style={{
            background: cloudinaryStatus?.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${cloudinaryStatus?.enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: '0.5rem',
            padding: '0.45rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
          title="Click to configure Cloudinary acceleration"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Cloud size={14} color={cloudinaryStatus?.enabled ? '#10b981' : '#f59e0b'} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cloudinaryStatus?.enabled ? '#059669' : '#d97706' }}>
              {cloudinaryStatus?.enabled ? 'Cloudinary CDN Active' : 'Cloudinary Standby'}
            </span>
          </div>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cloudinaryStatus?.enabled ? '#10b981' : '#f59e0b' }} />
        </div>
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
                setDomain(domain === 'off-campus' ? 'on-campus' : 'off-campus');
                setIsUserMenuOpen(false);
              }}
            >
              <Sparkles size={15} />
              <span>{domain === 'off-campus' ? 'Switch to Campus View' : 'Switch to City View'}</span>
            </button>

            <button 
              className="dropdown-item"
              onClick={() => {
                setIsSettingsOpen(true);
                setIsUserMenuOpen(false);
              }}
            >
              <Settings size={15} />
              <span>Settings & Cloudinary</span>
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
