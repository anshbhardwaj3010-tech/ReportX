import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const IssueContext = createContext();

export const IssueProvider = ({ children }) => {
  const [domain, setDomain] = useState('on-campus'); // 'on-campus' | 'off-campus'
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('reportx_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const role = currentUser?.role || 'student';

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const hasVerifiedEmailLink = useRef(false);
  const hasShownApiError = useRef(false);
  const showEffectToast = (message, type) => {
    const id = Date.now();
    setToastMessage({ message, type, id });
    window.setTimeout(() => {
      setToastMessage((current) => current?.id === id ? null : current);
    }, 4000);
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers
      }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(result.error || 'The request could not be completed.');
      error.status = response.status;
      error.duplicate = result.duplicate;
      throw error;
    }
    return result;
  };

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
          }
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

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4000);
  };

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
    setIsAuthModalOpen(false);
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

  const getStaffApplications = () => request('/admin/staff-applications');
  const getTechnicians = () => request('/admin/technicians');
  const getPendingIssueReviews = () => request('/admin/issues/pending-review');
  const approveStaffApplication = (userId) => request(`/admin/staff-applications/${userId}/approve`, {
    method: 'PUT'
  });
  const assignIssue = (issueId, technicianId) => request(`/issues/${issueId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ technicianId })
  });
  const reviewIssue = (issueId, decision, reason = '') => request(`/issues/${issueId}/review`, {
    method: 'PUT',
    body: JSON.stringify({ decision, reason })
  });

  const uploadImage = async (file) => {
    if (!authToken) throw new Error('Sign in before uploading an image.');
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Image upload failed.');
    const apiOrigin = API_URL.replace(/\/api\/?$/, '');
    return new URL(result.url, apiOrigin).toString();
  };

  const logout = () => {
    localStorage.removeItem('reportx_token');
    setAuthToken(null);
    setCurrentUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const addIssue = async (newIssueData) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const { issue } = await request('/issues', { method: 'POST', body: JSON.stringify(newIssueData) });
      setIssues((previous) => [issue, ...previous.filter((item) => item.id !== issue.id)]);
      addNotification(`New issue ${issue.id} was reported.`, 'success');
      showToast(`Issue ${issue.id} reported.`, 'success');
      setIsReportModalOpen(false);
    } catch (error) {
      if (error.status === 409 && error.duplicate) {
        setIssues((previous) => [error.duplicate, ...previous.filter((item) => item.id !== error.duplicate.id)]);
        showToast(error.message, 'error');
        return { duplicate: error.duplicate };
      }
      showToast(error.message, 'error');
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

  return (
    <IssueContext.Provider value={{
      domain, setDomain,
      role,
      currentUser,
      isAuthModalOpen, setIsAuthModalOpen,
      login, signup, resendVerification, logout,
      getStaffApplications, getTechnicians, getPendingIssueReviews,
      approveStaffApplication, assignIssue, reviewIssue,
      uploadImage,
      issues,
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
