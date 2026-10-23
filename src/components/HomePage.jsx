import React, { useEffect, useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { 
  ShieldAlert, ShieldCheck, Zap, Sparkles, Clock, Camera, 
  CheckCircle2, MapPin, Phone, Mail, Building2, 
  Users, ArrowRight, ChevronDown, ChevronUp, Moon, Sun, 
  LogIn, UserPlus, LayoutDashboard, LogOut, Send, 
  Wrench, Droplets, Wifi, Lightbulb, HeartHandshake, Shield
} from 'lucide-react';
import './HomePage.css';

const CURRENT_YEAR = new Date().getFullYear();

export const HomePage = () => {
  const { 
    currentUser, 
    issues,
    logout, 
    openAuthModal, 
    setIsReportModalOpen, 
    setCurrentView,
    theme, 
    setTheme, 
    showToast,
    submitContact
  } = useIssues();

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactDepartment, setContactDepartment] = useState('general');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [contactError, setContactError] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Guarded Report Click Handler
  const handleReportClick = () => {
    if (!currentUser) {
      showToast('Please log in or sign up to submit an incident report.', 'info');
      openAuthModal('signin');
    } else {
      setIsReportModalOpen(true);
    }
  };

  useEffect(() => {
    const captureInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const clearInstallPrompt = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', captureInstallPrompt);
    window.addEventListener('appinstalled', clearInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
      window.removeEventListener('appinstalled', clearInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSending(true);
    setContactSent(false);
    setContactError('');
    try {
      const result = await submitContact({
        name: contactName,
        email: contactEmail,
        department: contactDepartment,
        message: contactMessage
      });
      setContactSent(true);
      showToast(result.message, 'success');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (error) {
      setContactSent(false);
      setContactError(error.message);
      showToast(error.message, 'error');
    } finally {
      setContactSending(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayName = currentUser?.name || '';
  const userInitials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const publicIssues = issues.filter((issue) => issue.isGenuine === true);
  const activeIssueCount = publicIssues.filter((issue) => issue.status !== 'resolved').length;
  const resolvedIssueCount = publicIssues.filter((issue) => issue.status === 'resolved').length;
  const recentIssues = [...publicIssues]
    .sort((first, second) => new Date(second.reportedAt || 0) - new Date(first.reportedAt || 0))
    .slice(0, 3);

  const faqItems = [
    {
      q: 'Why is user login required to submit an issue report?',
      a: 'Requiring a login guarantees authentic reports from verified university students, faculty, or community residents. It prevents malicious spam, allows you to receive status updates via notification/email, and lets you verify and rate the technician\'s repair upon completion.'
    },
    {
      q: 'What happens after I submit an issue?',
      a: 'Once submitted, our AI engine immediately screens your photo/video evidence, tags the urgency, and checks for existing duplicates in that location. Next, the system alerts the on-duty department specialist (e.g., electrician, plumber) who dispatches with an active SLA timer.'
    },
    {
      q: 'How does AI duplicate detection work?',
      a: 'If a broken tap or classroom projector has already been reported by another person in the same wing, our system identifies the match. You will be prompted to upvote the existing ticket instead of creating redundant work orders, ensuring higher priority for that problem.'
    },
    {
      q: 'How fast are critical emergency issues resolved?',
      a: 'Safety hazards like electrical sparks, water pipeline bursts, or security lock failures are automatically tagged as High Urgency with a rapid response SLA of under 2 hours.'
    },
    {
      q: 'Can off-campus residents and PG students use ReportX?',
      a: 'Yes! ReportX supports dual modes: On-Campus (hostels, academic blocks, labs) and Off-Campus/Civic (rental flats, PGs, household maintenance). You can choose your location domain when submitting.'
    }
  ];

  const categories = [
    {
      id: 'electrical',
      title: 'Electrical & Power',
      icon: Lightbulb,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      desc: 'Classroom lighting, switchboards, short circuits, laboratory power backups, and wiring faults.'
    },
    {
      id: 'plumbing',
      title: 'Plumbing & Drainage',
      icon: Droplets,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
      desc: 'Water supply leaks, tap repairs, clogged drainage lines, washroom fixtures, and water tank overflows.'
    },
    {
      id: 'ro-water',
      title: 'RO Drinking Water',
      icon: ShieldCheck,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.1)',
      desc: 'Water purifier filter replacement, chiller faults, TDS testing, and floor water dispenser maintenance.'
    },
    {
      id: 'appliance',
      title: 'Appliances & Geysers',
      icon: Wrench,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.1)',
      desc: 'Air conditioners, hostel water heaters/geysers, ceiling fans, and common area electronic equipment.'
    },
    {
      id: 'it-wifi',
      title: 'IT & Wi-Fi Networks',
      icon: Wifi,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
      desc: 'Access point outages, lab LAN connections, router hardware faults, and campus connectivity drops.'
    },
    {
      id: 'cleanliness',
      title: 'Hygiene & Cleanliness',
      icon: Sparkles,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      desc: 'Waste disposal, sanitization, corridor sweeping, pest control, and campus hygiene compliance.'
    }
  ];

  return (
    <div className="home-page-container">
      {/* --------------------------------------------------------------------
          1. Modern Sticky Navbar
          -------------------------------------------------------------------- */}
      <nav className="home-navbar" aria-label="Main Navigation">
        <div className="home-nav-inner">
          {/* Brand Logo & Title */}
          <div className="home-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="home-brand-logo">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="home-brand-title">
                ReportX
                <span className="home-brand-badge">Civic & Campus</span>
              </div>
              <p className="home-brand-sub">Smart Facility & Incident Management</p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <div className="home-nav-links">
            <button className="home-nav-link" onClick={() => scrollToSection('about')}>
              About Us
            </button>
            <button className="home-nav-link" onClick={() => scrollToSection('how-it-works')}>
              How It Works
            </button>
            <button className="home-nav-link" onClick={() => scrollToSection('categories')}>
              Services
            </button>
            <button className="home-nav-link" onClick={() => scrollToSection('contact')}>
              Contact
            </button>
            <button className="home-nav-link" onClick={() => scrollToSection('faq')}>
              FAQ
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="home-nav-actions">
            {installPrompt && (
              <button className="btn-nav-login" onClick={handleInstall}>
                Install App
              </button>
            )}
            {/* Theme Toggle */}
            <button 
              className="icon-action-btn"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
              style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.45rem' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Prominent REPORT ISSUE Button (Always visible on top) */}
            <button 
              className="btn-report-cta" 
              onClick={handleReportClick}
              title={currentUser ? "Submit a new incident report" : "Login required to submit a report"}
            >
              <Zap size={16} strokeWidth={2.5} />
              <span>Report Issue</span>
            </button>

            {/* Authentication States */}
            {currentUser ? (
              <>
                {/* Operations Dashboard Button for Logged-In Users */}
                <button 
                  className="btn-nav-dashboard"
                  onClick={() => setCurrentView('overview')}
                  title="Open Operations Center"
                >
                  <LayoutDashboard size={15} />
                  <span>Operations</span>
                </button>

                {/* User Pill */}
                <div className="nav-user-pill" title={`Signed in as ${displayName}`}>
                  <span className="nav-user-avatar">{userInitials}</span>
                  <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button 
                  className="btn-nav-login"
                  onClick={logout}
                  title="Sign Out"
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <button 
                  className="btn-nav-login"
                  onClick={() => openAuthModal('signin')}
                >
                  <LogIn size={15} />
                  <span>Login</span>
                </button>

                {/* Sign Up Button */}
                <button 
                  className="btn-nav-signup"
                  onClick={() => openAuthModal('signup')}
                >
                  <UserPlus size={15} />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --------------------------------------------------------------------
          2. Hero Section
          -------------------------------------------------------------------- */}
      <header className="home-hero">
        <div className="hero-pill-badge">
          <Sparkles size={14} />
          <span>Next-Gen Incident & Facilities Resolution</span>
        </div>

        <h1 className="hero-main-title">
          Empowering Campuses & Communities with <span className="hero-gradient-text">Fast, Transparent Resolutions</span>
        </h1>

        <p className="hero-subtitle">
          Report municipal, classroom, lab, or household issues and follow their progress through review, dispatch, and resolution.
        </p>

        {/* Hero CTAs */}
        <div className="hero-cta-group">
          <button className="btn-hero-primary" onClick={handleReportClick}>
            <Zap size={20} />
            <span>Report An Issue Now</span>
            <ArrowRight size={18} />
          </button>

          <button className="btn-hero-secondary" onClick={() => scrollToSection('how-it-works')}>
            <Clock size={18} />
            <span>See How It Works</span>
          </button>

          {currentUser && (
            <button 
              className="btn-hero-secondary" 
              onClick={() => setCurrentView('overview')}
              style={{ background: 'var(--primary-subtle)', borderColor: 'var(--primary-border)', color: 'var(--primary)' }}
            >
              <LayoutDashboard size={18} />
              <span>Go to Operations Dashboard</span>
            </button>
          )}
        </div>

        {/* 4 Interactive Feature Highlights (No internal info, purely platform benefits) */}
        <div className="hero-capabilities-grid">
          <div className="capability-card">
            <div className="capability-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
              <Camera size={22} />
            </div>
            <h3 className="capability-title">30-Sec Smart Report</h3>
            <p className="capability-desc">
              Snap a quick photo or video of the issue. Location is tagged automatically with no cumbersome paperwork.
            </p>
          </div>

          <div className="capability-card">
            <div className="capability-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Zap size={22} />
            </div>
            <h3 className="capability-title">AI Duplicate Merge</h3>
            <p className="capability-desc">
              Smart algorithms identify duplicate reports in the same location and automatically pool community upvotes.
            </p>
          </div>

          <div className="capability-card">
            <div className="capability-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Clock size={22} />
            </div>
            <h3 className="capability-title">Transparent SLA Clocks</h3>
            <p className="capability-desc">
              Real-time countdowns track technician dispatch, progress updates, and completion targets without delays.
            </p>
          </div>

          <div className="capability-card">
            <div className="capability-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 className="capability-title">Verified Proof of Work</h3>
            <p className="capability-desc">
              Technicians upload before & after photographic evidence upon fix completion for community sign-off.
            </p>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------
          3. Platform Metrics & Reliability Strip
          -------------------------------------------------------------------- */}
      <section className="home-metrics-strip" aria-label="Platform Statistics">
        <div className="metrics-strip-inner">
          <div>
            <div className="metric-item-num">{publicIssues.length}</div>
            <div className="metric-item-label">Verified reports tracked</div>
          </div>
          <div>
            <div className="metric-item-num">{activeIssueCount}</div>
            <div className="metric-item-label">Active verified reports</div>
          </div>
          <div>
            <div className="metric-item-num">{resolvedIssueCount}</div>
            <div className="metric-item-label">Verified reports resolved</div>
          </div>
          <div>
            <div className="metric-item-num">Live</div>
            <div className="metric-item-label">Data from ReportX</div>
          </div>
        </div>
      </section>
      <section className="home-live-reports" aria-label="Recent verified reports">
        <div className="home-live-reports-heading">
          <div>
            <span className="home-live-indicator" />
            <h2>Recent community reports</h2>
          </div>
          <span>Live ReportX data</span>
        </div>
        {recentIssues.length ? (
          <div className="home-live-reports-grid">
            {recentIssues.map((issue) => (
              <article className="home-live-report-card" key={issue.id}>
                <div>
                  <span className={`home-live-status home-live-status-${issue.status}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  <span className="home-live-domain">{issue.domain === 'on-campus' ? 'Campus' : 'Community'}</span>
                </div>
                <h3>{issue.title}</h3>
                <p>{issue.location}</p>
                <small>Ticket #{issue.id}</small>
              </article>
            ))}
          </div>
        ) : (
          <p className="home-live-empty">Verified public reports will appear here when available.</p>
        )}
      </section>

      {/* --------------------------------------------------------------------
          4. How It Works Section
          -------------------------------------------------------------------- */}
      <section id="how-it-works" className="home-section">
        <div className="section-header-center">
          <span className="section-tag">Simple & Transparent Process</span>
          <h2 className="section-title">How ReportX Works</h2>
          <p className="section-description">
            From the moment you spot a maintenance problem to its verified resolution, every stage is fully traceable.
          </p>
        </div>

        <div className="how-it-works-grid">
          <div className="step-card">
            <div className="step-num-badge">01</div>
            <div className="step-icon-wrap">
              <Camera size={24} />
            </div>
            <h3>1. Spot & Capture</h3>
            <p>
              Encounter a water leakage, broken switch, or network failure? Take a picture or video, choose the location, and hit submit.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">02</div>
            <div className="step-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Sparkles size={24} />
            </div>
            <h3>2. AI Screening & Dispatch</h3>
            <p>
              Our automated system classifies the category, detects duplicate complaints, and assigns the certified technician immediately.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">03</div>
            <div className="step-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Clock size={24} />
            </div>
            <h3>3. Live Tracking & Repair</h3>
            <p>
              Monitor the live work order progress as the specialist reaches the site and carries out the technical repair under SLA timers.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">04</div>
            <div className="step-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <ShieldCheck size={24} />
            </div>
            <h3>4. Proof & Verification</h3>
            <p>
              The technician uploads proof photos of the resolved issue. Reporters verify the fix and rate the quality of service.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. Service Categories Coverage
          -------------------------------------------------------------------- */}
      <section id="categories" className="home-section" style={{ background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <div className="section-header-center">
          <span className="section-tag">Comprehensive Coverage</span>
          <h2 className="section-title">What You Can Report</h2>
          <p className="section-description">
            ReportX handles end-to-end incident logging across campus facilities, laboratories, hostels, and residential zones.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="category-showcase-card">
                <div className="category-card-icon" style={{ background: cat.bg, color: cat.color }}>
                  <Icon size={22} />
                </div>
                <div>
                  <h4>{cat.title}</h4>
                  <p>{cat.desc}</p>
                  <span className="category-tag-pill">Dedicated Dispatch Team</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------------
          6. About Us Section
          -------------------------------------------------------------------- */}
      <section id="about" className="home-section">
        <div className="about-two-column">
          <div className="about-text-content">
            <span className="section-tag">Our Mission & Purpose</span>
            <h2>Bridging the Gap Between Communities and Facility Operations</h2>
            <p>
              Traditional complaints often get buried in paper register books, lost in email threads, or stalled with no accountability.
              <strong> ReportX</strong> was built to revolutionize facility management across universities and residential sectors.
            </p>
            <p>
              By combining instant mobile-first reporting with AI categorization and transparent SLA clocks, we ensure every broken
              pipe, faulty switch, or damaged infrastructure item is addressed with speed, rigor, and verified photographic evidence.
            </p>

            <div className="about-pillars-grid">
              <div className="pillar-box">
                <h4><ShieldCheck size={18} color="#10b981" /> Radical Transparency</h4>
                <p>Every ticket lifecycle is visible to the reporting community in real time.</p>
              </div>
              <div className="pillar-box">
                <h4><Clock size={18} color="#2563eb" /> SLA Accountability</h4>
                <p>Strict resolution deadlines ensure prompt response times for technicians.</p>
              </div>
              <div className="pillar-box">
                <h4><Users size={18} color="#f59e0b" /> Community Driven</h4>
                <p>Upvoting highlights high-impact issues to prioritize immediate action.</p>
              </div>
              <div className="pillar-box">
                <h4><Sparkles size={18} color="#8b5cf6" /> Modern AI Screening</h4>
                <p>Auto-categorization and duplicate merging save technician time and effort.</p>
              </div>
            </div>
          </div>

          <div className="about-visual-card">
            <div className="mission-statement-box">
              <h3>Our Vision</h3>
              <p>
                To create cleaner, safer, and technologically integrated campus and urban living environments 
                where every citizen voice translates directly into operational action.
              </p>
            </div>

            <div className="trust-badges-row">
              <div className="trust-badge-item">
                <Building2 size={16} color="var(--primary)" />
                <span>Delhi-NCR Institutional Edition</span>
              </div>
              <div className="trust-badge-item">
                <Shield size={16} color="#10b981" />
                <span>Verified Specialist Network</span>
              </div>
              <div className="trust-badge-item">
                <HeartHandshake size={16} color="#ea580c" />
                <span>Community Powered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          7. Frequently Asked Questions (FAQ)
          -------------------------------------------------------------------- */}
      <section id="faq" className="home-section" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div className="section-header-center">
          <span className="section-tag">Got Questions?</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-description">
            Everything you need to know about reporting, verification, and our maintenance lifecycle.
          </p>
        </div>

        <div className="faq-list">
          {faqItems.map((item, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button 
                  className="faq-question-btn"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------------
          8. Contact Us & Help Center
          -------------------------------------------------------------------- */}
      <section id="contact" className="home-section">
        <div className="section-header-center">
          <span className="section-tag">Reach Our Facilities Team</span>
          <h2 className="section-title">Get in Touch with ReportX Support</h2>
          <p className="section-description">
            Need urgent help, have inquiries regarding institutional deployment, or want to speak with facilities staff?
          </p>
        </div>

        <div className="contact-grid">
          {/* Contact Details Card */}
          <div className="contact-info-card">
            <div>
              <div className="contact-info-header">
                <h3>Contact Information</h3>
                <p>
                  Our campus maintenance dispatch desk and civic coordination team are available around the clock.
                </p>
              </div>

              <div className="contact-details-list">
                <div className="contact-detail-row">
                  <div className="contact-detail-icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h5>Main Facilities Command Center</h5>
                    <p>
                      Infrastructure & Maintenance Directorate, Block B, Campus Grounds, 
                      Delhi-NCR, Ghaziabad, UP - 201009
                    </p>
                  </div>
                </div>

                <div className="contact-detail-row">
                  <div className="contact-detail-icon">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h5>Help Desk & Telephone</h5>
                    <p>
                      <a href="tel:+911202845112">+91 (120) 284-5112</a> &bull; <a href="tel:+919871234567">+91 98712 34567</a>
                    </p>
                  </div>
                </div>

                <div className="contact-detail-row">
                  <div className="contact-detail-icon">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h5>Email Inquiries</h5>
                    <p>
                      <a href="mailto:support@reportx.org">support@reportx.org</a> &bull; <a href="mailto:facilities@abesit.in">facilities@abesit.in</a>
                    </p>
                  </div>
                </div>

                <div className="contact-detail-row">
                  <div className="contact-detail-icon">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h5>Desk Operating Hours</h5>
                    <p>Monday &ndash; Saturday: 8:00 AM &ndash; 8:00 PM</p>
                    <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Emergency Safety Dispatch: 24/7 Available</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="emergency-helpline-box">
              <Zap size={22} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <h5>Urgent Safety Hazard Hotline</h5>
                <p>For immediate fire, gas leak, or electrical sparks: Dial Ext. 991 immediately.</p>
              </div>
            </div>
          </div>

          {/* Interactive Contact Form Card */}
          <div className="contact-form-card">
            <h3>Send Us a Message</h3>
            <p>Send your inquiry to the facilities team and include an email address for their reply.</p>

            <form onSubmit={handleContactSubmit}>
              <label className="form-group-label" htmlFor="contact-name">
                Your Full Name
              </label>
              <input 
                id="contact-name"
                className="form-field-input" 
                type="text" 
                placeholder="e.g. Rahul Sharma" 
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />

              <label className="form-group-label" htmlFor="contact-email">
                Email Address
              </label>
              <input 
                id="contact-email"
                className="form-field-input" 
                type="email" 
                placeholder="you@example.com" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />

              <label className="form-group-label" htmlFor="contact-department">
                Inquiry Topic / Department
              </label>
              <select 
                id="contact-department"
                className="form-field-select"
                value={contactDepartment}
                onChange={(e) => setContactDepartment(e.target.value)}
              >
                <option value="general">General Inquiry</option>
                <option value="campus_support">Campus Infrastructure Support</option>
                <option value="technician_inquiry">Join Maintenance Technician Crew</option>
                <option value="feedback">Platform Suggestion & Feedback</option>
              </select>

              <label className="form-group-label" htmlFor="contact-message">
                Message Details
              </label>
              <textarea 
                id="contact-message"
                className="form-field-textarea" 
                rows={4} 
                placeholder="Please describe how we can assist you..." 
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
              />

              <button type="submit" className="btn-form-submit" disabled={contactSending}>
                <Send size={16} />
                <span>{contactSending ? 'Sending…' : contactSent ? 'Message Sent!' : 'Send Inquiry'}</span>
              </button>
              {contactError && <p className="contact-form-error" role="alert">{contactError}</p>}
              <p className="contact-form-status" role="status" aria-live="polite">
                {contactSent ? 'Your inquiry was delivered to the facilities team.' : 'Your email address is used so the team can reply.'}
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          9. Bottom Call-To-Action Banner
          -------------------------------------------------------------------- */}
      <section className="home-bottom-cta">
        <h2 className="bottom-cta-title">Ready to Report a Facility Issue?</h2>
        <p className="bottom-cta-sub">
          Help keep your university and community clean, safe, and functioning at its peak.
          Submit your report in seconds or sign in to track active resolutions.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-report-cta" 
            onClick={handleReportClick}
            style={{ padding: '0.85rem 1.8rem', fontSize: '1rem', background: '#ffffff', color: '#1e3a8a', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)' }}
          >
            <Zap size={18} color="#ea580c" />
            <span style={{ fontWeight: 800 }}>Report An Issue Now</span>
          </button>
          {!currentUser ? (
            <button 
              className="btn-hero-secondary"
              onClick={() => openAuthModal('signin')}
              style={{ padding: '0.85rem 1.6rem', background: 'rgba(255, 255, 255, 0.15)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <LogIn size={18} />
              <span>Sign In to Your Account</span>
            </button>
          ) : (
            <button 
              className="btn-hero-secondary"
              onClick={() => setCurrentView('overview')}
              style={{ padding: '0.85rem 1.6rem', background: 'rgba(255, 255, 255, 0.15)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <LayoutDashboard size={18} />
              <span>Go to Operations Center</span>
            </button>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------------------
          10. Modern Footer
          -------------------------------------------------------------------- */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="home-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="home-brand-logo">
                <ShieldAlert size={20} />
              </div>
              <div>
                <div className="home-brand-title">ReportX</div>
                <p className="home-brand-sub">Smart Facility & Incident Management</p>
              </div>
            </div>
            <p>
              A transparent, next-generation civic and campus incident reporting system designed to ensure every maintenance
              ticket is resolved promptly with verified proof of work.
            </p>
          </div>

          <div className="footer-col">
            <h5>Navigation</h5>
            <div className="footer-links-list">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
              <button onClick={() => scrollToSection('about')}>About Us</button>
              <button onClick={() => scrollToSection('how-it-works')}>How It Works</button>
              <button onClick={() => scrollToSection('categories')}>Maintenance Services</button>
              <button onClick={() => scrollToSection('faq')}>FAQ</button>
            </div>
          </div>

          <div className="footer-col">
            <h5>Get Started</h5>
            <div className="footer-links-list">
              <button onClick={handleReportClick}>Report an Issue</button>
              {!currentUser ? (
                <>
                  <button onClick={() => openAuthModal('signin')}>Sign In</button>
                  <button onClick={() => openAuthModal('signup')}>Create Account</button>
                </>
              ) : (
                <>
                  <button onClick={() => setCurrentView('overview')}>Operations Dashboard</button>
                  <button onClick={logout}>Sign Out</button>
                </>
              )}
              <button onClick={() => scrollToSection('contact')}>Support Desk</button>
            </div>
          </div>

          <div className="footer-col">
            <h5>Operations</h5>
            <div className="footer-links-list">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Delhi-NCR Headquarters</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Block B Facilities Desk</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Emergency Line: Ext. 991</p>
              <div style={{ marginTop: '0.5rem' }}>
                <span className="status-indicator-pill">
                  <span className="status-dot-pulse" />
                  <span>Systems Operational</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>
            &copy; {CURRENT_YEAR} ReportX Incident Management Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Privacy Policy</span>
            &bull;
            <span>Terms of Service</span>
            &bull;
            <span>Campus Safety Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
