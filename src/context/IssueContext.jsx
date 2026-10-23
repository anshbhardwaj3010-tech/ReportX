import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { CATEGORIES } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const IssueContext = createContext();

export const IssueProvider = ({ children }) => {
  const [domain, setDomain] = useState('off-campus'); // 'off-campus' (City Dashboard) | 'on-campus'
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'overview' | 'map' | 'reports' | 'work_orders' | 'alerts' | 'analytics' | 'team' | 'settings'
  const [theme, setTheme] = useState(() => localStorage.getItem('fixly_theme') || 'light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cloudinaryStatus, setCloudinaryStatus] = useState({ enabled: false, cloudName: null });

  const [authToken, setAuthToken] = useState(() => localStorage.getItem('reportx_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const role = currentUser?.role || 'student';

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin' | 'signup'

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const [issues, setIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const hasVerifiedEmailLink = useRef(false);
  const hasShownApiError = useRef(false);

  // Sync theme with document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fixly_theme', theme);
  }, [theme]);

  // Check Cloudinary status
  useEffect(() => {
    fetch(`${API_URL}/cloudinary/status`)
      .then(res => res.json())
      .then(data => setCloudinaryStatus(data))
      .catch(() => {});
  }, []);
  const showEffectToast = (message, type) => {
    const id = Date.now();
    setToastMessage({ message, type, id });
    window.setTimeout(() => {
      setToastMessage((current) => current?.id === id ? null : current);
    }, 4000);
  };

  const request = useCallback(async (path, options = {}) => {
    let response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...options.headers
        }
      });
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          `Could not reach the ReportX API at ${API_URL}. Make sure the API is running, ` +
          'VITE_API_URL points to the correct address, and CLIENT_URL allows this page. ' +
          'For local development, start it with "npm run server" and restart it after changing server/.env. ' +
          'You do not need to create the account again if signup already completed.'
        );
      }
      throw error;
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(result.error || 'The request could not be completed.');
      error.status = response.status;
      error.duplicate = result.duplicate;
      error.assessment = result.assessment;
      throw error;
    }
    return result;
  }, [authToken]);

  useEffect(() => {
    const verifyToken = new URLSearchParams(window.location.search).get('verifyToken');
    if (verifyToken && !hasVerifiedEmailLink.current) {
      hasVerifiedEmailLink.current = true;
      fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken })
      })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Email verification failed.');
          showEffectToast(result.message, 'success');
        })
        .catch((error) => showEffectToast(error.message, 'error'))
        .finally(() => window.history.replaceState({}, '', window.location.pathname));
    }
    if (authToken) {
      fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${authToken}` } })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Session expired.');
          setCurrentUser(result.user);
        })
        .catch(() => {
          localStorage.removeItem('reportx_token');
          setAuthToken(null);
          setCurrentUser(null);
        });
    }
    const refreshIssues = async () => {
      try {
        const response = await fetch(`${API_URL}/issues`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });
        if (!response.ok) throw new Error('Could not load live issues. Check that the API and database are running.');
        setIssues(await response.json());
        hasShownApiError.current = false;
        if (authToken) {
          const userResponse = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          if (userResponse.ok) {
            const { user } = await userResponse.json();
            setCurrentUser(user);
            if (user.role === 'admin' || user.role === 'technician') {
              if (user.role === 'technician' || user.role === 'pending_technician') setDomain(user.operationDomain || 'on-campus');
              setMyIssues([]);
            } else {
              const mineResponse = await fetch(`${API_URL}/issues/mine`, {
                headers: { Authorization: `Bearer ${authToken}` }
              });
              if (!mineResponse.ok) throw new Error('Could not load your reports.');
              setMyIssues(await mineResponse.json());
            }
          }
        } else {
          setMyIssues([]);
        }
      } catch (error) {
        if (!hasShownApiError.current) {
          hasShownApiError.current = true;
          showEffectToast(error.message, 'error');
        }
      }
    };
    refreshIssues();
    const refreshTimer = window.setInterval(refreshIssues, 5000);
    return () => window.clearInterval(refreshTimer);
  }, [authToken]);

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const addNotification = (text, type = 'info') => {
    const newNotif = {
      id: `n-${Date.now()}`,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const login = async (email, password) => {
    const { token, user } = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('reportx_token', token);
    setAuthToken(token);
    setCurrentUser(user);
    if (user.role === 'technician' || user.role === 'pending_technician') setDomain(user.operationDomain || 'on-campus');
    setIssues([]);
    setMyIssues([]);
    setNotifications([]);
    setSelectedIssue(null);
    setIsReportModalOpen(false);
    setIsAuthModalOpen(false);
    setCurrentView('overview');
    showToast(`Welcome, ${user.name}.`, 'success');
    addNotification(`Signed in as ${user.name}.`, 'info');
  };

  const signup = async (details) => {
    const result = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(details)
    });
    showToast(result.message, 'success');
    return result;
  };

  const resendVerification = (email) => request('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email })
  });

  const getStaffApplications = (operationDomain) => request(`/admin/staff-applications?domain=${encodeURIComponent(operationDomain)}`);
  const getTechnicians = useCallback((operationDomain) => request(`/admin/technicians?domain=${encodeURIComponent(operationDomain)}`), [request]);
  const getPendingIssueReviews = () => request('/admin/issues/pending-review');
  const approveStaffApplication = (userId, operationDomain) => request(`/admin/staff-applications/${userId}/approve?domain=${encodeURIComponent(operationDomain)}`, {
    method: 'PUT'
  });
  const assignIssue = async (issueId, technicianId, operationDomain) => {
    const result = await request(`/issues/${issueId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ technicianId, operationDomain })
    });
    if (result.issue) {
      setIssues((previous) => previous.map((issue) => issue.id === issueId ? result.issue : issue));
    }
    return result;
  };
  const reviewIssue = async (issueId, decision, reason = '') => {
    const result = await request(`/issues/${issueId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ decision, reason })
    });
    if (result.issue) {
      setIssues((previous) => [
        result.issue,
        ...previous.filter((issue) => issue.id !== issueId)
      ]);
    }
    return result;
  };

  const uploadImage = async (file) => {
    if (!authToken) throw new Error('Sign in before uploading an image.');
    const formData = new FormData();
    formData.append('media', file);
    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Image upload failed.');
    if (result.url && (result.url.startsWith('http://') || result.url.startsWith('https://'))) {
      return result.url;
    }
    const apiOrigin = API_URL.replace(/\/api\/?$/, '');
    return new URL(result.url, apiOrigin).toString();
  };

  const logout = () => {
    localStorage.removeItem('reportx_token');
    setAuthToken(null);
    setCurrentUser(null);
    setIssues([]);
    setMyIssues([]);
    setNotifications([]);
    setSelectedIssue(null);
    setIsReportModalOpen(false);
    setCurrentView('home');
    showToast('Logged out successfully.', 'info');
  };

  const addIssue = async (newIssueData) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const { issue, message } = await request('/issues', { method: 'POST', body: JSON.stringify(newIssueData) });
      setIssues((previous) => [issue, ...previous.filter((item) => item.id !== issue.id)]);
      if (currentUser.role !== 'admin' && currentUser.role !== 'technician') {
        setMyIssues((previous) => [issue, ...previous.filter((item) => item.id !== issue.id)]);
      }
      const reviewPending = issue.isGenuine === null;
      const confirmation = message || (reviewPending
        ? `Issue ${issue.id} was submitted and is waiting for manual review.`
        : `Issue ${issue.id} was reported.`);
      addNotification(confirmation, reviewPending ? 'info' : 'success');
      showToast(confirmation, reviewPending ? 'info' : 'success');
      setIsReportModalOpen(false);
    } catch (error) {
      if (error.status === 409 && error.duplicate) {
        setIssues((previous) => [error.duplicate, ...previous.filter((item) => item.id !== error.duplicate.id)]);
        showToast(error.message, 'error');
        return { duplicate: error.duplicate };
      }
      showToast(error.message, 'error');
      if ([422, 503].includes(error.status)) {
        return { screeningFailed: true, message: error.message, assessment: error.assessment };
      }
      return null;
    }
  };

  const upvoteIssue = async (issueId) => {
    try {
      const { issue } = await request(`/issues/${issueId}/upvote`, { method: 'POST' });
      setIssues((previous) => previous.map((item) => item.id === issueId ? issue : item));
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const updateIssueStatus = async (issueId, newStatus, workerName, proofPhoto, notes) => {
    try {
      const { issue } = await request(`/issues/${issueId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, afterImageUrl: proofPhoto, resolutionNotes: notes })
      });
      setIssues((previous) => previous.map((item) => item.id === issueId ? issue : item));
      addNotification(`Issue ${issueId} status changed to ${newStatus.replace('_', ' ')}.`, 'status');
      showToast(`Issue ${issueId} updated.`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const addComment = async (issueId, commentText) => {
    try {
      const { issue } = await request(`/issues/${issueId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText })
      });
      setIssues((previous) => previous.map((item) => item.id === issueId ? issue : item));
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const verifyAndRateIssue = async (issueId, rating) => {
    try {
      const { issue } = await request(`/issues/${issueId}/rating`, {
        method: 'POST',
        body: JSON.stringify({ rating })
      });
      setIssues((previous) => previous.map((item) => item.id === issueId ? issue : item));
      showToast('Thank you for rating the resolution.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // AI Classification engine simulation
  const aiClassify = (text, imagePreset) => {
    const lower = (text || '').toLowerCase();
    if (imagePreset) {
      const cat = CATEGORIES.find(c => c.id === imagePreset.category) || CATEGORIES[0];
      return { category: cat.id, categoryName: cat.name, urgency: 'high', confidence: 98, title: imagePreset.title };
    }
    if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('drain')) {
      return { category: 'plumbing', categoryName: 'Plumbing & Water', urgency: 'high', confidence: 96, title: 'Water Leakage Issue' };
    }
    if (lower.includes('light') || lower.includes('spark') || lower.includes('switch') || lower.includes('power') || lower.includes('socket') || lower.includes('fuse')) {
      return { category: 'electrical', categoryName: 'Electrical & Power', urgency: 'high', confidence: 97, title: 'Electrical Socket Fault' };
    }
    if (lower.includes('ro') || lower.includes('filter') || lower.includes('purifier') || lower.includes('drinking')) {
      return { category: 'ro-water', categoryName: 'RO Water Purifier', urgency: 'medium', confidence: 99, title: 'RO Purifier Maintenance' };
    }
    if (lower.includes('geyser') || lower.includes('ac') || lower.includes('heater') || lower.includes('fan') || lower.includes('appliance')) {
      return { category: 'appliance', categoryName: 'Geyser & Appliances', urgency: 'medium', confidence: 94, title: 'Appliance Failure' };
    }
    if (lower.includes('wifi') || lower.includes('internet') || lower.includes('network') || lower.includes('router')) {
      return { category: 'it-wifi', categoryName: 'IT & Wi-Fi Network', urgency: 'high', confidence: 95, title: 'Wi-Fi Network Outage' };
    }
    return { category: 'cleanliness', categoryName: 'Cleanliness & Hygiene', urgency: 'low', confidence: 90, title: 'General Maintenance' };
  };

  const dashboardIssues = currentUser?.role === 'admin' || currentUser?.role === 'technician'
    ? issues
    : myIssues;

  return (
    <IssueContext.Provider value={{
      domain, setDomain,
      currentView, setCurrentView,
      theme, setTheme,
      isSettingsOpen, setIsSettingsOpen,
      cloudinaryStatus, setCloudinaryStatus,
      role,
      currentUser,
      isAuthModalOpen, setIsAuthModalOpen,
      authModalMode, setAuthModalMode, openAuthModal,
      login, signup, resendVerification, logout,
      getStaffApplications, getTechnicians, getPendingIssueReviews,
      approveStaffApplication, assignIssue, reviewIssue,
      uploadImage,
      issues,
      dashboardIssues,
      notifications,
      searchQuery, setSearchQuery,
      categoryFilter, setCategoryFilter,
      statusFilter, setStatusFilter,
      isReportModalOpen, setIsReportModalOpen,
      selectedIssue, setSelectedIssue,
      toastMessage,
      addIssue,
      upvoteIssue,
      updateIssueStatus,
      addComment,
      verifyAndRateIssue,
      aiClassify,
      showToast
    }}>
      {children}
    </IssueContext.Provider>
  );
};

export const useIssues = () => useContext(IssueContext);
