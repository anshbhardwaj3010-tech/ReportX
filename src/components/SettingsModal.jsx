import React from 'react';
import { useIssues } from '../context/IssueContext';
import { X, Cloud, Moon, Sun, Zap } from 'lucide-react';

export const SettingsModal = () => {
  const { 
    isSettingsOpen, setIsSettingsOpen, 
    theme, setTheme, 
    cloudinaryStatus,
  } = useIssues();

  if (!isSettingsOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-subtle)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
              <Zap size={18} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>Platform Settings & Acceleration</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure media delivery and appearance</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Section 1: Cloudinary CDN Acceleration */}
        <div style={{ 
          background: cloudinaryStatus?.enabled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)', 
          border: `1px solid ${cloudinaryStatus?.enabled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`, 
          borderRadius: '0.75rem', 
          padding: '1.15rem', 
          marginBottom: '1.25rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cloud size={18} color={cloudinaryStatus?.enabled ? '#10b981' : '#f59e0b'} />
              <strong style={{ fontSize: '0.92rem', color: cloudinaryStatus?.enabled ? '#065f46' : '#92400e' }}>
                Cloudinary High-Speed Media CDN
              </strong>
            </div>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              padding: '0.2rem 0.55rem', 
              borderRadius: '9999px',
              background: cloudinaryStatus?.enabled ? '#10b981' : '#f59e0b',
              color: 'white'
            }}>
              {cloudinaryStatus?.enabled ? 'ACTIVE & ACCELERATED' : 'LOCAL CACHE MODE'}
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '0.75rem' }}>
            Cloudinary automatically converts incident photos and videos to WebP/AVIF format with <code>q_auto, f_auto</code>, delivering instant thumbnails and 80%+ bandwidth reduction for fast loading.
          </p>

          <div style={{ fontSize: '0.74rem', background: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <strong>Configuration Status:</strong> {cloudinaryStatus?.enabled ? `Connected to Cloud: ${cloudinaryStatus.cloudName}` : 'Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env'}
          </div>
        </div>

        {/* Section 2: Visual Theme & Appearance */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Visual Theme
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setTheme('light')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '0.65rem',
                border: `2px solid ${theme === 'light' ? 'var(--primary)' : 'var(--border-color)'}`,
                background: theme === 'light' ? 'var(--primary-subtle)' : 'var(--bg-card)',
                color: theme === 'light' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              <Sun size={16} />
              <span>ReportX Crisp Light (Default)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '0.65rem',
                border: `2px solid ${theme === 'dark' ? 'var(--primary)' : 'var(--border-color)'}`,
                background: theme === 'dark' ? 'var(--primary-subtle)' : 'var(--bg-card)',
                color: theme === 'dark' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              <Moon size={16} />
              <span>Midnight Operations Dark</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => setIsSettingsOpen(false)}
            style={{ padding: '0.6rem 1.4rem' }}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
