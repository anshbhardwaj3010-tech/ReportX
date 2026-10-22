import React from 'react';
import { IssueProvider, useIssues } from './context/IssueContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { NeedsAttentionBanner } from './components/NeedsAttentionBanner';
import { StatsRow } from './components/StatsRow';
import { HighPriorityList } from './components/HighPriorityList';
import { LiveMapWidget } from './components/LiveMapWidget';
import { RecentReportsTable } from './components/RecentReportsTable';
import { NavigationViews } from './components/NavigationViews';
import { SettingsModal } from './components/SettingsModal';
import { QuickReportModal } from './components/QuickReportModal';
import { IssueDetailModal } from './components/IssueDetailModal';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './components/HomePage';

const DashboardMain = () => {
  const { currentView, setCurrentView, toastMessage } = useIssues();

  return (
    <>
      {currentView === 'home' ? (
        <HomePage />
      ) : (
        <div className="app-shell">
          {/* 1. Left Fixed Navigation Sidebar */}
          <Sidebar />

          {/* 2. Operations Center Main Viewport */}
          <main className="main-viewport">
            {/* Top Header Bar with Live Date & Notifications */}
            <TopHeader />

            {currentView === 'overview' ? (
              <>
                {/* Needs Attention [Action Required] Banner */}
                <NeedsAttentionBanner 
                  onFocusFilter={(type) => {
                    if (type === 'unassigned') setCurrentView('work_orders');
                    else if (type === 'overdue' || type === 'nearing_sla') setCurrentView('alerts');
                  }} 
                />

                {/* 5 KPI Metric Cards Row */}
                <StatsRow />

                {/* Two-Column Middle Section: High Priority List + Live Map */}
                <div className="two-column-grid">
                  <HighPriorityList onViewAll={() => setCurrentView('reports')} />
                  <LiveMapWidget onExpandMap={() => setCurrentView('map')} />
                </div>

                {/* Bottom Section: Recent Reports Data Table */}
                <RecentReportsTable onViewAll={() => setCurrentView('reports')} />
              </>
            ) : (
              /* Secondary Views (Map, Reports, Work Orders, Alerts, Analytics, Team) */
              <NavigationViews />
            )}
          </main>
        </div>
      )}

      {/* Floating Modals */}
      <SettingsModal />
      <QuickReportModal />
      <IssueDetailModal />
      <AuthModal />

      {/* Global Dynamic Toast Notification */}
      {toastMessage && (
        <div className="toast-container" role="status" aria-live="polite">
          {toastMessage.type === 'error' ? (
            <AlertCircle size={18} color="#ef4444" />
          ) : toastMessage.type === 'info' ? (
            <Info size={18} color="#38bdf8" />
          ) : (
            <CheckCircle2 size={18} color="#10b981" />
          )}
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{toastMessage.message}</span>
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <IssueProvider>
      <DashboardMain />
    </IssueProvider>
  );
}
