import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { AlertCircle, CheckCircle2, GraduationCap, Lock, Mail, ShieldCheck, User, X } from 'lucide-react';
import './AuthModal.css';

const DELHI_NCR_COLLEGES = [
  'ABES Institute of Technology (ABESIT), Ghaziabad',
  'ABES Engineering College (ABESEC), Ghaziabad',
  'Ajay Kumar Garg Engineering College (AKGEC), Ghaziabad',
  'KIET Group of Institutions, Ghaziabad',
  'JSS Academy of Technical Education, Noida',
  'Galgotias College of Engineering & Technology, Greater Noida',
  'Jaypee Institute of Information Technology (JIIT), Noida',
  'Delhi Technological University (DTU), Delhi',
  'Netaji Subhas University of Technology (NSUT), Delhi',
  'Guru Gobind Singh Indraprastha University (GGSIPU), Delhi'
];

const MAINTENANCE_DEPARTMENTS = [
  { id: 'general', name: 'General maintenance' },
  { id: 'electrical', name: 'Electrician / Electrical' },
  { id: 'plumbing', name: 'Plumber / Plumbing' },
  { id: 'appliance', name: 'Appliances / Geyser' },
  { id: 'ro-water', name: 'RO / Water purifier' },
  { id: 'it-wifi', name: 'IT / Network' },
  { id: 'cleanliness', name: 'Cleanliness / Housekeeping' },
  { id: 'furniture', name: 'Furniture / Locks' },
  { id: 'safety', name: 'Safety / Security' }
];

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalMode, login, signup, resendVerification } = useIssues();
  const [isSignupTab, setIsSignupTab] = useState(authModalMode === 'signup');
  const [accountType, setAccountType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(DELHI_NCR_COLLEGES[0]);
  const [department, setDepartment] = useState('general');
  const [operationDomain, setOperationDomain] = useState('on-campus');
  const [errorMsg, setErrorMsg] = useState('');
  const [existingAccount, setExistingAccount] = useState(false);
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setIsSignupTab(authModalMode === 'signup');
    setErrorMsg('');
    setExistingAccount(false);
    setNotice('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setExistingAccount(false);
    setNotice('');
    setIsSubmitting(true);
    try {
      if (isSignupTab) {
        if (!name.trim() || !collegeId.trim()) throw new Error(accountType === 'student' ? 'Enter your name and college ID.' : 'Enter your name and employee ID.');
        if (collegeId.trim().length < 5) throw new Error(`${accountType === 'student' ? 'College' : 'Employee'} ID must contain at least 5 characters.`);
        const result = await signup({
          name: name.trim(), email, password, collegeId: collegeId.trim(), collegeName: selectedCollege,
          accountType, department, operationDomain
        });
        setNotice(result.message);
      } else {
        await login(email, password);
      }
    } catch (error) {
      setErrorMsg(error.message);
      setExistingAccount(error.status === 409);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await resendVerification(email);
      setNotice(result.message);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div className="modal-content auth-modal" onClick={(event) => event.stopPropagation()}>
        <div className="auth-modal-header">
          <div>
            <div className="auth-brand-mark"><ShieldCheck size={19} /></div>
            <h2 className="auth-title">
              {isSignupTab ? 'Create your account' : 'Sign in to ReportX'}
            </h2>
            <p className="auth-subtitle">
              {isSignupTab ? accountType === 'maintenance' ? 'Maintenance staff accounts require office approval.' : 'Verify your email to activate your account.' : 'Use your verified email address.'}
            </p>
          </div>
          <button className="auth-close" onClick={() => setIsAuthModalOpen(false)} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Account access">
          {[false, true].map((signupMode) => (
            <button
              key={String(signupMode)}
              type="button"
              role="tab"
              aria-selected={isSignupTab === signupMode}
              className={`auth-tab${isSignupTab === signupMode ? ' is-active' : ''}`}
              onClick={() => { setIsSignupTab(signupMode); setErrorMsg(''); setExistingAccount(false); setNotice(''); }}
            >
              {signupMode ? 'Create account' : 'Sign in'}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="auth-message auth-message-error" role="alert">
            <AlertCircle size={16} /> <span>{errorMsg}</span>
          </div>
        )}
        {notice && (
          <div className="auth-message auth-message-success" role="status">
            <CheckCircle2 size={16} /> <span>{notice}</span>
          </div>
        )}
        {existingAccount && (
          <button
            type="button"
            className="auth-existing-account"
            onClick={() => { setIsSignupTab(false); setExistingAccount(false); setErrorMsg(''); }}
          >
            Sign in with this email instead
          </button>
        )}
        {isSignupTab && (
          <button type="button" disabled={isSubmitting || !email} onClick={handleResendVerification} className="auth-resend">
            {isSubmitting ? 'Sending...' : 'Resend verification email'}
          </button>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignupTab && <>
            <div className="auth-account-types">
              {[
                { id: 'student', label: 'Student' },
                { id: 'maintenance', label: 'Maintenance staff' }
              ].map((option) => (
                <button key={option.id} type="button" onClick={() => setAccountType(option.id)} className={`auth-account-type${accountType === option.id ? ' is-active' : ''}`} aria-pressed={accountType === option.id}>
                  {option.label}
                </button>
              ))}
            </div>
            <label className="auth-label">
              FULL NAME
              <span className="auth-input-wrap">
                <User size={16} className="auth-input-icon" />
                <input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your name" className="auth-input" />
              </span>
            </label>
            <label className="auth-label">
              COLLEGE
              <select value={selectedCollege} onChange={(event) => setSelectedCollege(event.target.value)} className="auth-input auth-select">
                {DELHI_NCR_COLLEGES.map((college) => <option key={college} value={college}>{college}</option>)}
              </select>
            </label>
            <label className="auth-label">
              {accountType === 'student' ? 'COLLEGE ID' : 'EMPLOYEE ID'}
              <span className="auth-input-wrap">
                <GraduationCap size={16} className="auth-input-icon" />
                <input required value={collegeId} onChange={(event) => setCollegeId(event.target.value)} autoComplete="off" placeholder={accountType === 'student' ? 'Student / roll number' : 'Maintenance employee ID'} className="auth-input" />
              </span>
            </label>
            {accountType === 'maintenance' && (
              <>
                <label className="auth-label">
                  OPERATION SCOPE
                  <select value={operationDomain} onChange={(event) => setOperationDomain(event.target.value)} className="auth-input auth-select">
                    <option value="on-campus">Campus Operations</option>
                    <option value="off-campus">City Operations</option>
                  </select>
                  <small className="auth-help-text">Your approved account will only receive work orders for this operation.</small>
                </label>
                <label className="auth-label">
                  MAINTENANCE DEPARTMENT
                  <select value={department} onChange={(event) => setDepartment(event.target.value)} className="auth-input auth-select">
                    {MAINTENANCE_DEPARTMENTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
              </>
            )}
          </>}

          <label className="auth-label">
            EMAIL ADDRESS
            <span className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" className="auth-input" />
            </span>
          </label>
          <label className="auth-label">
            PASSWORD
            <span className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignupTab ? 'new-password' : 'current-password'} placeholder="At least 8 characters" className="auth-input" />
            </span>
          </label>
          <button disabled={isSubmitting} type="submit" className="auth-submit">
            {isSubmitting ? <span className="auth-spinner" aria-hidden="true" /> : <ShieldCheck size={17} />}
            <span>{isSubmitting ? 'Please wait...' : isSignupTab ? 'Create account and send verification' : 'Sign in'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};