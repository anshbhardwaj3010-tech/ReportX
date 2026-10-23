import React, { lazy, Suspense } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { IssueProvider, useIssues } from './context/IssueContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { StatsRow } from './components/StatsRow';
import { RecentReportsTable } from './components/RecentReportsTable';
import { SettingsModal } from './components/SettingsModal';
import { QuickReportModal } from './components/QuickReportModal';
import { IssueDetailModal } from './components/IssueDetailModal';
import { AuthModal } from './components/AuthModal';

const HomePage = lazy(() => import('./components/HomePage').then(({ HomePage }) => ({ default: HomePage })));
const NavigationViews = lazy(() => import('./components/NavigationViews').then(({ NavigationViews }) => ({ default: NavigationViews })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(({ AdminDashboard }) => ({ default: AdminDashboard })));
const MaintenancePortal = lazy(() => import('./components/MaintenancePortal').then(({ MaintenancePortal }) => ({ default: MaintenancePortal })));
const StudentDashboard = lazy(() => import('./components/StudentDashboard').then(({ StudentDashboard }) => ({ default: StudentDashboard })));

const DashboardMain = () => {
  const { currentView, setCurrentView, toastMessage, role, domain, isReportModalOpen } = useIssues();

  return (
    <>
      <Suspense fallback={<div className="app-loading" role="status" aria-live="polite">Loading ReportX…</div>}>
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
                role === 'admin' ? (
                  <AdminDashboard />
                ) : role === 'technician' ? (
                  <MaintenancePortal />
                ) : (
                  <>
                    <StudentDashboard />
                    <StatsRow />
                    <RecentReportsTable onViewAll={() => setCurrentView('reports')} />
                  </>
                )
              ) : currentView === 'work_orders' && role === 'technician' ? (
                <MaintenancePortal />
              ) : (
                /* Secondary Views (Map, Reports, Work Orders, Alerts, Analytics, Team) */
                <NavigationViews />
              )}
            </main>
          </div>
        )}
      </Suspense>

      {/* Floating Modals */}
      <SettingsModal />
      <QuickReportModal key={`${domain}-${isReportModalOpen ? 'open' : 'closed'}`} />
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
