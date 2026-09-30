import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';
import { useIssues } from '../context/IssueContext';

export const PhotoUpload = ({ label, value, onChange, onUploadingChange }) => {
  const { uploadImage } = useIssues();
  const cameraInput = useRef(null);
  const galleryInput = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setIsUploading(true);
    onUploadingChange?.(true);
    try {
      const uploadedImage = await uploadImage(file);
      onChange(uploadedImage);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>{label}</label>
      <input ref={cameraInput} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFile} style={visuallyHidden} />
      <input ref={galleryInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} style={visuallyHidden} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button type="button" className="btn-secondary" disabled={isUploading} onClick={() => cameraInput.current?.click()}>
          <Camera size={17} /> Take photo
        </button>
        <button type="button" className="btn-secondary" disabled={isUploading} onClick={() => galleryInput.current?.click()}>
          <ImagePlus size={17} /> Choose photo
        </button>
        {isUploading && <span role="status" style={{ alignSelf: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>Uploading...</span>}
      </div>
      {error && <p role="alert" style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.4rem' }}>{error}</p>}
      {value && (
        <div style={{ position: 'relative', width: 'fit-content', marginTop: '0.65rem' }}>
          <img src={value} alt="Selected issue evidence" style={{ display: 'block', maxWidth: '100%', width: 'min(320px, 70vw)', maxHeight: '180px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)' }} />
          <button type="button" aria-label="Remove photo" title="Remove photo" onClick={() => onChange('')} style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', display: 'grid', placeItems: 'center', width: '32px', height: '32px', border: 0, borderRadius: '50%', color: 'white', background: 'rgba(0,0,0,0.75)', cursor: 'pointer' }}>
            <X size={17} />
          </button>
        </div>
      )}
      <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem' }}>JPEG, PNG, or WebP; maximum 8 MB.</p>
    </div>
  );
};

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0
};