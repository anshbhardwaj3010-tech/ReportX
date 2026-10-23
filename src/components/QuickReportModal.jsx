import React, { useEffect, useRef, useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { CATEGORIES, ON_CAMPUS_LOCATIONS, OFF_CAMPUS_LOCATIONS, getLocationCoordinates } from '../data/mockData';
import { PhotoUpload } from './PhotoUpload';
import { X, Sparkles, AlertTriangle, Zap, MapPin, Building2, ClipboardCheck, ShieldCheck, LocateFixed } from 'lucide-react';
import './QuickReportModal.css';

export const QuickReportModal = () => {
  const { 
    isReportModalOpen, setIsReportModalOpen, 
    addIssue, domain, aiClassify, issues, upvoteIssue, currentUser, showToast
  } = useIssues();

  const [formDomain, setFormDomain] = useState(domain);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('electrical');
  const [location, setLocation] = useState(domain === 'on-campus' ? ON_CAMPUS_LOCATIONS[0] : OFF_CAMPUS_LOCATIONS[0]);
  const [urgency, setUrgency] = useState('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isEvidenceUploading, setIsEvidenceUploading] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [screeningError, setScreeningError] = useState(null);
  const [gpsCoordinates, setGpsCoordinates] = useState(null);
  const [gpsMessage, setGpsMessage] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [draftStorageError, setDraftStorageError] = useState('');
  const [draftLoadRevision, setDraftLoadRevision] = useState(0);
  const draftKey = currentUser ? `reportx_issue_draft_${currentUser.id}` : null;
  const loadedDraftFor = useRef(null);
  const skipDraftSave = useRef(false);

  useEffect(() => {
    if (!isReportModalOpen || !draftKey) {
      loadedDraftFor.current = null;
      return;
    }
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (draft) {
        setFormDomain(draft.formDomain === 'on-campus' ? 'on-campus' : 'off-campus');
        setTitle(draft.title || '');
        setDescription(draft.description || '');
        setCategory(draft.category || 'electrical');
        setLocation(draft.location || (domain === 'on-campus' ? ON_CAMPUS_LOCATIONS[0] : OFF_CAMPUS_LOCATIONS[0]));
        setUrgency(draft.urgency || 'medium');
        setImageUrl(draft.imageUrl || '');
        setVideoUrl(draft.videoUrl || '');
        setGpsCoordinates(draft.gpsCoordinates || null);
        setGpsMessage(draft.gpsCoordinates ? 'Saved GPS coordinates restored.' : '');
        setAiMessage(null);
        setScreeningError(null);
      } else {
        setFormDomain(domain);
        setLocation(domain === 'on-campus' ? ON_CAMPUS_LOCATIONS[0] : OFF_CAMPUS_LOCATIONS[0]);
        setTitle('');
        setDescription('');
        setCategory('electrical');
        setUrgency('medium');
        setImageUrl('');
        setVideoUrl('');
        setGpsCoordinates(null);
        setGpsMessage('');
        setAiMessage(null);
        setScreeningError(null);
      }
      loadedDraftFor.current = draftKey;
      skipDraftSave.current = true;
      setDraftLoadRevision((revision) => revision + 1);
      setDraftStorageError('');
    } catch {
      setFormDomain(domain);
      setTitle('');
      setDescription('');
      setCategory('electrical');
      setLocation(domain === 'on-campus' ? ON_CAMPUS_LOCATIONS[0] : OFF_CAMPUS_LOCATIONS[0]);
      setUrgency('medium');
      setImageUrl('');
      setVideoUrl('');
      setGpsCoordinates(null);
      setGpsMessage('');
      setDraftStorageError('Could not restore your saved draft from this browser.');
      loadedDraftFor.current = draftKey;
      skipDraftSave.current = true;
      setDraftLoadRevision((revision) => revision + 1);
    }
  }, [isReportModalOpen, draftKey, domain]);

  useEffect(() => {
    if (!isReportModalOpen || !draftKey || loadedDraftFor.current !== draftKey) return;
    if (skipDraftSave.current) {
      skipDraftSave.current = false;
      return;
    }
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        formDomain, title, description, category, location, urgency,
        imageUrl, videoUrl, gpsCoordinates
      }));
      setDraftStorageError('');
    } catch {
      setDraftStorageError('Draft storage is unavailable. Keep this form open until you can submit.');
    }
  }, [isReportModalOpen, draftKey, draftLoadRevision, formDomain, title, description, category, location, urgency, imageUrl, videoUrl, gpsCoordinates]);

  if (!isReportModalOpen) return null;

  // Handle AI Auto-Classification
  const handleAIClassify = (customText, preset) => {
    const textToClassify = customText || `${title} ${description}`;
    const result = aiClassify(textToClassify, preset);

    setCategory(result.category);
    setUrgency(result.urgency);
    if (!title && result.title) setTitle(result.title);
    setAiConfidence(result.confidence);
    setAiMessage(`Suggested category: ${result.categoryName}`);

    // Check duplicate warning
    checkDuplicate(location, result.category);
  };

  const checkDuplicate = (loc, cat, candidateDomain = formDomain) => {
    const duplicate = issues.find(i =>
      i.domain === candidateDomain && i.location === loc && i.category === cat &&
      i.status !== 'resolved' && i.isGenuine !== false
    );
    if (duplicate) {
      setDuplicateWarning(duplicate);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !videoUrl || duplicateWarning || isEvidenceUploading) return;
    setScreeningError(null);

    const result = await addIssue({
      title,
      description,
      category,
      domain: formDomain,
      location,
      coords: gpsCoordinates
        ? [gpsCoordinates.latitude, gpsCoordinates.longitude]
        : getLocationCoordinates(location),
      urgency,
      imageUrl,
      videoUrl,
      aiConfidence
    });
    if (result === null) return;
    if (result?.screeningFailed) {
      setScreeningError(result);
      return;
    }
    if (result?.duplicate) {
      setDuplicateWarning(result.duplicate);
      return;
    }

    // Reset form
    setTitle('');
    setDescription('');
    setImageUrl('');
    setVideoUrl('');
    setGpsCoordinates(null);
    setAiMessage(null);
    setDuplicateWarning(null);
    if (draftKey) {
      try {
        localStorage.removeItem(draftKey);
      } catch {
        showToast('Your report was submitted, but the saved draft could not be removed from this browser.', 'error');
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage('Location is not supported by this browser.');
      return;
    }
    if (!window.isSecureContext) {
      setGpsMessage('Live location requires HTTPS. Open this site over HTTPS or use localhost during development.');
      return;
    }
    setGpsLoading(true);
    setGpsMessage('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = { latitude: coords.latitude, longitude: coords.longitude };
        const currentLocation = `Current location (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`;
        setGpsCoordinates(coordinates);
        setLocation(currentLocation);
        setGpsMessage('Your coordinates will be attached to this report.');
        checkDuplicate(currentLocation, category);
        setGpsLoading(false);
      },
      (error) => {
        setGpsMessage(error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. You can still choose a location manually.'
          : 'Could not determine your location. Choose a location manually or try again.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="modal-overlay" onClick={() => setIsReportModalOpen(false)}>
      <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <div>
            <div className="report-modal-heading">
              <span className="report-heading-icon"><ClipboardCheck size={20} /></span>
              <div>
                <h2>Report an issue</h2>
                <p className="report-heading-subtitle">Tell us what needs attention. We’ll route it to the right team.</p>
              </div>
            </div>
            <div className="report-requirement"><ShieldCheck size={15} /><span>A short video is required; a photo is optional.</span></div>
          </div>
          <button 
            className="report-close"
            onClick={() => setIsReportModalOpen(false)}
            aria-label="Close report form"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <section className="report-section">
            <div className="report-section-heading"><span className="report-step">01</span><div><h3>Where is the issue?</h3><p>Choose the area that best describes it.</p></div></div>
            <div className="report-domain-grid">
              <button 
                type="button"
                className={`report-domain-option${formDomain === 'on-campus' ? ' is-active campus' : ''}`}
                aria-pressed={formDomain === 'on-campus'}
                onClick={() => { setFormDomain('on-campus'); setLocation(ON_CAMPUS_LOCATIONS[0]); setGpsCoordinates(null); setGpsMessage(''); checkDuplicate(ON_CAMPUS_LOCATIONS[0], category, 'on-campus'); }}
              >
                <Building2 size={19} /><span><strong>Campus facilities</strong><small>Hostels, classrooms, labs</small></span>
              </button>
              <button 
                type="button"
                className={`report-domain-option${formDomain === 'off-campus' ? ' is-active city' : ''}`}
                aria-pressed={formDomain === 'off-campus'}
                onClick={() => { setFormDomain('off-campus'); setLocation(OFF_CAMPUS_LOCATIONS[0]); setGpsCoordinates(null); setGpsMessage(''); checkDuplicate(OFF_CAMPUS_LOCATIONS[0], category, 'off-campus'); }}
              >
                <MapPin size={19} /><span><strong>Off-campus & household</strong><small>Neighborhoods, homes, streets</small></span>
              </button>
            </div>
          </section>

          <section className="report-section">
            <div className="report-section-heading"><span className="report-step">02</span><div><h3>Add evidence</h3><p>A video helps the team understand and verify the issue.</p></div></div>
            <div className="report-evidence-grid">
              <div className="report-evidence-card"><PhotoUpload label="PHOTO · OPTIONAL" value={imageUrl} onChange={(value) => { setImageUrl(value); setScreeningError(null); }} onUploadingChange={setIsEvidenceUploading} /></div>
              <div className="report-evidence-card is-required"><PhotoUpload label="VIDEO · REQUIRED" value={videoUrl} onChange={(value) => { setVideoUrl(value); setScreeningError(null); }} onUploadingChange={setIsEvidenceUploading} allowVideo videoOnly /></div>
            </div>
          </section>

          {screeningError && (
            <div className="report-alert report-screening-error" role="alert">
              <strong>Report not submitted</strong>
              <p>{screeningError.message}</p>
              {screeningError.assessment?.summary && <p>AI finding: {screeningError.assessment.summary}</p>}
              {screeningError.assessment?.flags?.length > 0 && <p>Flags: {screeningError.assessment.flags.map((flag) => flag.replaceAll('_', ' ')).join(', ')}</p>}
            </div>
          )}

          {/* AI Banner Message */}
          {aiMessage && (
            <div className="report-ai-message">
              <Sparkles size={16} color="#818cf8" />
              <span>{aiMessage}</span>
            </div>
          )}

          {/* Title & Description Inputs */}
          <section className="report-section">
            <div className="report-section-heading"><span className="report-step">03</span><div><h3>Describe the issue</h3><p>Give it a clear title and include useful details.</p></div></div>
            <div className="report-field">
            <div className="report-title-row">
              <label htmlFor="report-title" className="report-label">ISSUE TITLE</label>
              <button 
                type="button" 
                onClick={() => handleAIClassify()} 
                className="report-suggest"
              >
                <Sparkles size={13} />
                <span>Suggest category</span>
              </button>
            </div>
            <input 
              id="report-title"
              type="text"
              placeholder="e.g. RO water purifier not working"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleAIClassify()}
              required
              className="report-input"
            />
          </div>

          <div className="report-field">
            <label htmlFor="report-description" className="report-label">DESCRIPTION</label>
            <textarea 
              id="report-description"
              placeholder="Describe what happened, where it happened, and any symptoms you noticed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleAIClassify()}
              rows={3}
              required
              className="report-input report-description"
            />
          </div>
          </section>

          {/* Category & Location Row */}
          <div className="report-field-grid">
            <div className="report-field">
              <label htmlFor="report-category" className="report-label">CATEGORY</label>
              <select 
                id="report-category"
                value={category} 
                onChange={(e) => { setCategory(e.target.value); checkDuplicate(location, e.target.value); }}
                className="report-input report-select"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="report-field">
              <div className="report-title-row">
                <label htmlFor="report-location" className="report-label">LOCATION / ROOM</label>
                <button type="button" className="report-suggest" onClick={handleUseCurrentLocation} disabled={gpsLoading}>
                  <LocateFixed size={13} />
                  <span>{gpsLoading ? 'Finding location…' : 'Use my location'}</span>
                </button>
              </div>
              <select 
                id="report-location"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setGpsCoordinates(null); setGpsMessage(''); checkDuplicate(e.target.value, category); }}
                className="report-input report-select"
              >
                {gpsCoordinates && <option value={location}>{location}</option>}
                {(formDomain === 'on-campus' ? ON_CAMPUS_LOCATIONS : OFF_CAMPUS_LOCATIONS).map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              {gpsMessage && <p className="report-location-message" role="status">{gpsMessage}</p>}
              <p className="report-location-message">Exact coordinates may appear on operations maps. Use GPS for the issue location, not a private location you do not want shared.</p>
            </div>
          </div>

          {/* Smart Duplicate Alert Warning */}
          {duplicateWarning && (
            <div className="report-alert report-duplicate-warning">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={18} className="report-alert-icon" />
                <div>
                  <p className="report-alert-title">Similar issue already reported</p>
                  <p className="report-alert-copy">
                    An unresolved {formDomain} ticket <strong>#{duplicateWarning.id} ({duplicateWarning.title})</strong> is already reported at {location}.
                  </p>
                  <button 
                    type="button"
                    onClick={() => {
                      upvoteIssue(duplicateWarning.id);
                      setIsReportModalOpen(false);
                    }}
                    className="report-upvote"
                  >
                    +1 I Face This Too (Upvote Existing Ticket #{duplicateWarning.id})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Urgency Radio Selector */}
          <section className="report-section report-urgency-section">
            <div className="report-section-heading"><span className="report-step">04</span><div><h3>Set urgency</h3><p>Choose how quickly this issue needs attention.</p></div></div>
            <div className="report-urgency-grid">
              {[
                { id: 'low', label: 'Low', color: '#10b981' },
                { id: 'medium', label: 'Medium', color: '#f59e0b' },
                { id: 'high', label: 'High', color: '#ef4444' },
                { id: 'emergency', label: 'Emergency 🔥', color: '#dc2626' }
              ].map(u => (
                <button
                  key={u.id}
                  type="button"
                  className={`report-urgency-option${urgency === u.id ? ` is-active urgency-${u.id}` : ''}`}
                  aria-pressed={urgency === u.id}
                  onClick={() => setUrgency(u.id)}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </section>

          {/* Buttons */}
          <div className="report-form-actions">
            <button
              type="button"
              className="btn-secondary report-cancel"
              onClick={() => {
                if (!draftKey) return;
                try {
                  localStorage.setItem(draftKey, JSON.stringify({
                    formDomain, title, description, category, location, urgency,
                    imageUrl, videoUrl, gpsCoordinates
                  }));
                  showToast('Your report draft is saved on this device.', 'success');
                } catch {
                  setDraftStorageError('Draft storage is unavailable. Keep this form open until you can submit.');
                }
              }}
            >
              Save draft
            </button>
            <button type="button" className="btn-secondary report-cancel" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary report-submit" disabled={isEvidenceUploading || !videoUrl || Boolean(duplicateWarning)}>
              <Zap size={18} />
              <span>AI Check & Submit</span>
            </button>
          </div>
          {draftStorageError && <p className="report-location-message" role="alert">{draftStorageError}</p>}
          <p className="report-location-message">Your draft stays in this browser on this device. Report submission still requires an internet connection.</p>
        </form>
      </div>
    </div>
  );
};
