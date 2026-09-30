import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { AlertCircle, CheckCircle2, GraduationCap, Lock, Mail, ShieldCheck, User, X } from 'lucide-react';

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
  const { isAuthModalOpen, setIsAuthModalOpen, login, signup, resendVerification } = useIssues();
  const [isSignupTab, setIsSignupTab] = useState(false);
  const [accountType, setAccountType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(DELHI_NCR_COLLEGES[0]);
  const [department, setDepartment] = useState('general');
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setNotice('');
    setIsSubmitting(true);
    try {
      if (isSignupTab) {
        if (!name.trim() || !collegeId.trim()) throw new Error(accountType === 'student' ? 'Enter your name and college ID.' : 'Enter your name and employee ID.');
        if (collegeId.trim().length < 5) throw new Error(`${accountType === 'student' ? 'College' : 'Employee'} ID must contain at least 5 characters.`);
        const result = await signup({
          name: name.trim(), email, password, collegeId: collegeId.trim(), collegeName: selectedCollege,
          accountType, department
        });
        setNotice(result.message);
      } else {
        await login(email, password);
      }
    } catch (error) {
      setErrorMsg(error.message);
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
      <div className="modal-content" onClick={(event) => event.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
              {isSignupTab ? 'Create your account' : 'Sign in to ReportX'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {isSignupTab ? accountType === 'maintenance' ? 'Maintenance staff accounts require office approval.' : 'Verify your email to activate your account.' : 'Use your verified email address.'}
            </p>
          </div>
          <button onClick={() => setIsAuthModalOpen(false)} aria-label="Close" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.25rem' }}>
          {[false, true].map((signupMode) => (
            <button
              key={String(signupMode)}
              type="button"
              onClick={() => { setIsSignupTab(signupMode); setErrorMsg(''); setNotice(''); }}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '0.4rem', border: 'none', fontWeight: 700,
                fontSize: '0.85rem', cursor: 'pointer', background: isSignupTab === signupMode ? 'var(--primary)' : 'transparent',
                color: isSignupTab === signupMode ? 'white' : '#94a3b8'
              }}
            >
              {signupMode ? 'Create account' : 'Sign in'}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
            <AlertCircle size={16} /> <span>{errorMsg}</span>
          </div>
        )}
        {notice && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
            <CheckCircle2 size={16} /> <span>{notice}</span>
          </div>
        )}
        {isSignupTab && (
          <button type="button" disabled={isSubmitting || !email} onClick={handleResendVerification} className="btn-secondary" style={{ justifyContent: 'center', marginBottom: '0.85rem' }}>
            {isSubmitting ? 'Sending...' : 'Resend verification email'}
          </button>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {isSignupTab && <>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { id: 'student', label: 'Student' },
                { id: 'maintenance', label: 'Maintenance staff' }
              ].map((option) => (
                <button key={option.id} type="button" onClick={() => setAccountType(option.id)} className={accountType === option.id ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, justifyContent: 'center', padding: '0.65rem 0.5rem' }}>
                  {option.label}
                </button>
              ))}
            </div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
              FULL NAME
              <span style={{ position: 'relative', display: 'block', marginTop: '0.25rem' }}>
                <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your name" style={inputStyle} />
              </span>
            </label>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
              COLLEGE
              <select value={selectedCollege} onChange={(event) => setSelectedCollege(event.target.value)} style={{ ...inputStyle, paddingLeft: '0.85rem' }}>
                {DELHI_NCR_COLLEGES.map((college) => <option key={college} value={college}>{college}</option>)}
              </select>
            </label>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
              {accountType === 'student' ? 'COLLEGE ID' : 'EMPLOYEE ID'}
              <span style={{ position: 'relative', display: 'block', marginTop: '0.25rem' }}>
                <GraduationCap size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input required value={collegeId} onChange={(event) => setCollegeId(event.target.value)} autoComplete="off" placeholder={accountType === 'student' ? 'Student / roll number' : 'Maintenance employee ID'} style={inputStyle} />
              </span>
            </label>
            {accountType === 'maintenance' && (
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                MAINTENANCE DEPARTMENT
                <select value={department} onChange={(event) => setDepartment(event.target.value)} style={{ ...inputStyle, paddingLeft: '0.85rem' }}>
                  {MAINTENANCE_DEPARTMENTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            )}
          </>}

          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
            EMAIL ADDRESS
            <span style={{ position: 'relative', display: 'block', marginTop: '0.25rem' }}>
              <Mail size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" style={inputStyle} />
            </span>
          </label>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
            PASSWORD
            <span style={{ position: 'relative', display: 'block', marginTop: '0.25rem' }}>
              <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignupTab ? 'new-password' : 'current-password'} placeholder="At least 8 characters" style={inputStyle} />
            </span>
          </label>
          <button disabled={isSubmitting} type="submit" className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            <ShieldCheck size={16} />
            <span>{isSubmitting ? 'Please wait...' : isSignupTab ? 'Create account and send verification' : 'Sign in'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  background: 'rgba(15, 23, 42, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '0.5rem',
  padding: '0.6rem 0.85rem 0.6rem 2.2rem',
  color: 'white',
  fontSize: '0.85rem',
  outline: 'none'
};