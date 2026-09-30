import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { Building2, Home, Search, Bell, PlusCircle, LogIn, LogOut, CheckCircle2, GraduationCap, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { 
    domain, setDomain, 
    currentUser, setIsAuthModalOpen, logout,
    notifications, 
    searchQuery, setSearchQuery,
    setIsReportModalOpen
  } = useIssues();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="navbar">
      {/* Brand Logo */}
      <div className="logo-container">
        <div className="logo-badge">
          <span>X</span>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="logo-text">ReportX</span>
            <span className="logo-tag">ABESIT AI</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#64748b' }}>ABES Institute of Technology Edition</p>
        </div>
      </div>

      {/* Domain Switcher */}
      <div className="domain-toggle">
        <button 
          className={`domain-tab ${domain === 'on-campus' ? 'active' : ''}`}
          onClick={() => setDomain('on-campus')}
        >
          <Building2 size={16} />
          <span>On-Campus</span>
        </button>
        <button 
          className={`domain-tab ${domain === 'off-campus' ? 'off-campus-active' : ''}`}
          onClick={() => setDomain('off-campus')}
        >
          <Home size={16} />
          <span>Off-Campus & Household</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', width: '180px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input 
          type="text"
          placeholder="Search ticket, room..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            padding: '0.45rem 1rem 0.45rem 2.2rem',
            color: 'white',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={() => document.getElementById('maintenance-office-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
          >
            <LayoutDashboard size={16} />
            <span>Office dashboard</span>
          </button>
        )}
        {/* User Auth Chip */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(30, 41, 59, 0.8)', padding: '0.35rem 0.65rem', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <GraduationCap size={15} color="#10b981" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{currentUser.name}</span>
                <CheckCircle2 size={12} color="#10b981" />
              </div>
              <span style={{ fontSize: '0.65rem', color: '#38bdf8', display: 'block' }}>
                ID: {currentUser.collegeId || 'ABESIT-2026'}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#fbbf24', display: 'block' }}>
                Reward points: {currentUser.rewardPoints || 0}
              </span>
            </div>
            <button 
              onClick={logout}
              title="Log Out"
              style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '0.2rem' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#a5b4fc',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer'
            }}
          >
            <LogIn size={15} />
            <span>Login / Signup</span>
          </button>
        )}

        {/* Notifications Tray Toggle */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#ef4444',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '50px',
              width: '320px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '0.75rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              zIndex: 200,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Live Notifications</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Real-time updates</span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p>{n.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <button 
          className="btn-primary" 
          onClick={() => setIsReportModalOpen(true)}
        >
          <PlusCircle size={18} />
          <span>Report Issue</span>
        </button>
      </div>
    </nav>
  );
};
