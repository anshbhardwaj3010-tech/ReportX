import React from 'react';
import { IssueProvider, useIssues } from './context/IssueContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { IssueFeed } from './components/IssueFeed';
import { IssueDetailModal } from './components/IssueDetailModal';
import { QuickReportModal } from './components/QuickReportModal';
import { CampusHeatmap } from './components/CampusHeatmap';
import { MaintenancePortal } from './components/MaintenancePortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const MainContent = () => {
  const { role, domain, toastMessage } = useIssues();

  return (
    <div>
      <Navbar />

      <main className="app-container">
        {/* Role Notice Indicator */}
        {role === 'pending_technician' && (
          <div style={{ marginTop: '1rem', padding: '0.85rem 1.25rem', border: '1px solid rgba(245,158,11,0.35)', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.1)', color: '#fcd34d', fontSize: '0.9rem' }}>
            Your maintenance staff application is verified and waiting for maintenance-office approval. Repair tools become available after approval.
          </div>
        )}

        {['admin', 'technician'].includes(role) && (
          <div style={{
            background: role === 'admin' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: role === 'admin' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: role === 'admin' ? '#a5b4fc' : '#6ee7b7' }}>
              <Info size={18} />
              <span>
                Active Mode: <strong>{role === 'admin' ? 'Maintenance Office Dispatch' : 'Assigned Technician Work Orders'}</strong>
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Access is based on your approved account role.</span>
          </div>
        )}

        {/* Hero & Interactive Health Index */}
        <HeroBanner />

        {/* Role-Based Primary Views */}
        {role === 'admin' && <AdminDashboard />}
        {role === 'technician' && <MaintenancePortal />}

        {/* Interactive Issue Feed */}
        <IssueFeed />

        {/* Interactive Heatmap */}
        <CampusHeatmap />
      </main>

      {/* Floating Modals */}
      <AuthModal />
      <QuickReportModal />
      <IssueDetailModal />

      {/* Dynamic Toast Popup */}
      {toastMessage && (
        <div className="toast-container">
          <CheckCircle2 size={20} color="#10b981" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMessage.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <IssueProvider>
      <MainContent />
    </IssueProvider>
  );
}
