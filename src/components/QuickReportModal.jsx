import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { CATEGORIES, ON_CAMPUS_LOCATIONS, OFF_CAMPUS_LOCATIONS } from '../data/mockData';
import { PhotoUpload } from './PhotoUpload';
import { X, Sparkles, AlertTriangle, Zap } from 'lucide-react';

export const QuickReportModal = () => {
  const { 
    isReportModalOpen, setIsReportModalOpen, 
    addIssue, domain, aiClassify, issues, upvoteIssue 
  } = useIssues();

  const [formDomain, setFormDomain] = useState(domain);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('electrical');
  const [location, setLocation] = useState(domain === 'on-campus' ? ON_CAMPUS_LOCATIONS[0] : OFF_CAMPUS_LOCATIONS[0]);
  const [urgency, setUrgency] = useState('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  if (!isReportModalOpen) return null;

  // Handle AI Auto-Classification
  const handleAIClassify = (customText, preset) => {
    const textToClassify = customText || `${title} ${description}`;
    const result = aiClassify(textToClassify, preset);

    setCategory(result.category);
    setUrgency(result.urgency);
    if (!title && result.title) setTitle(result.title);
    setAiConfidence(result.confidence);
    setAiMessage(`AI Vision classified: ${result.categoryName} (${result.confidence}% confidence)`);

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
    if (!title || !description || duplicateWarning || isImageUploading) return;

    const result = await addIssue({
      title,
      description,
      category,
      domain: formDomain,
      location,
      urgency,
      imageUrl,
      aiConfidence
    });
    if (result?.duplicate) {
      setDuplicateWarning(result.duplicate);
      return;
    }

    // Reset form
    setTitle('');
    setDescription('');
    setImageUrl('');
    setAiMessage(null);
    setDuplicateWarning(null);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsReportModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>Report Campus or Household Issue</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Fill in the issue details and optionally add a photo.</p>
          </div>
          <button 
            onClick={() => setIsReportModalOpen(false)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Domain Picker */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue Domain</label>
            <div className="report-domain-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.4rem' }}>
              <button 
                type="button"
                onClick={() => { setFormDomain('on-campus'); setLocation(ON_CAMPUS_LOCATIONS[0]); checkDuplicate(ON_CAMPUS_LOCATIONS[0], category, 'on-campus'); }}
                style={{
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  border: formDomain === 'on-campus' ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: formDomain === 'on-campus' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🏫 On-Campus Facilities
              </button>
              <button 
                type="button"
                onClick={() => { setFormDomain('off-campus'); setLocation(OFF_CAMPUS_LOCATIONS[0]); checkDuplicate(OFF_CAMPUS_LOCATIONS[0], category, 'off-campus'); }}
                style={{
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  border: formDomain === 'off-campus' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: formDomain === 'off-campus' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🏡 Off-Campus & Household
              </button>
            </div>
          </div>

          <PhotoUpload label="ISSUE PHOTO (OPTIONAL)" value={imageUrl} onChange={setImageUrl} onUploadingChange={setIsImageUploading} />

          {/* AI Banner Message */}
          {aiMessage && (
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc', fontSize: '0.85rem' }}>
              <Sparkles size={16} color="#818cf8" />
              <span>{aiMessage}</span>
            </div>
          )}

          {/* Title & Description Inputs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>ISSUE TITLE</label>
              <button 
                type="button" 
                onClick={() => handleAIClassify()} 
                style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Sparkles size={13} />
                <span>AI Auto-Detect Category</span>
              </button>
            </div>
            <input 
              type="text"
              placeholder="e.g. RO Water Purifier Fault or Burnt Switchboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleAIClassify()}
              required
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '0.5rem',
                padding: '0.65rem 0.85rem',
                color: 'white',
                fontSize: '0.9rem',
                marginTop: '0.3rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>DESCRIPTION</label>
            <textarea 
              placeholder="Describe the issue clearly (e.g., room number, symptoms)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleAIClassify()}
              rows={3}
              required
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '0.5rem',
                padding: '0.65rem 0.85rem',
                color: 'white',
                fontSize: '0.9rem',
                marginTop: '0.3rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Category & Location Row */}
          <div className="report-field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>CATEGORY</label>
              <select 
                value={category} 
                onChange={(e) => { setCategory(e.target.value); checkDuplicate(location, e.target.value); }}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '0.5rem',
                  padding: '0.65rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  marginTop: '0.3rem',
                  outline: 'none'
                }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>LOCATION / ROOM</label>
              <select 
                value={location}
                onChange={(e) => { setLocation(e.target.value); checkDuplicate(e.target.value, category); }}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '0.5rem',
                  padding: '0.65rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  marginTop: '0.3rem',
                  outline: 'none'
                }}
              >
                {(formDomain === 'on-campus' ? ON_CAMPUS_LOCATIONS : OFF_CAMPUS_LOCATIONS).map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Smart Duplicate Alert Warning */}
          {duplicateWarning && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.85rem', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>Smart Duplicate Alert!</p>
                  <p style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
                    An unresolved {formDomain} ticket <strong>#{duplicateWarning.id} ({duplicateWarning.title})</strong> is already reported at {location}.
                  </p>
                  <button 
                    type="button"
                    onClick={() => {
                      upvoteIssue(duplicateWarning.id);
                      setIsReportModalOpen(false);
                    }}
                    style={{
                      marginTop: '0.5rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '0.4rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    +1 I Face This Too (Upvote Existing Ticket #{duplicateWarning.id})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Urgency Radio Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>URGENCY LEVEL</label>
            <div className="report-urgency-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.3rem' }}>
              {[
                { id: 'low', label: 'Low', color: '#10b981' },
                { id: 'medium', label: 'Medium', color: '#f59e0b' },
                { id: 'high', label: 'High', color: '#ef4444' },
                { id: 'emergency', label: 'Emergency 🔥', color: '#dc2626' }
              ].map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUrgency(u.id)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '0.4rem',
                    border: urgency === u.id ? `2px solid ${u.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                    background: urgency === u.id ? `${u.color}20` : 'rgba(15, 23, 42, 0.6)',
                    color: urgency === u.id ? u.color : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isImageUploading || Boolean(duplicateWarning)}>
              <Zap size={18} />
              <span>Submit Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
