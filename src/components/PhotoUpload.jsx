import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Video, X } from 'lucide-react';
import { useIssues } from '../context/IssueContext';

export const PhotoUpload = ({ label, value, onChange, onUploadingChange, allowVideo = false, videoOnly = false }) => {
  const { uploadImage } = useIssues();
  const cameraInput = useRef(null);
  const galleryInput = useRef(null);
  const videoInput = useRef(null);
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
      const uploadedMedia = await uploadImage(file);
      onChange(uploadedMedia);
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
      {!videoOnly && <input ref={cameraInput} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFile} style={visuallyHidden} />}
      {!videoOnly && <input ref={galleryInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} style={visuallyHidden} />}
      {allowVideo && <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFile} style={visuallyHidden} />}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {!videoOnly && <button type="button" className="btn-secondary" disabled={isUploading} onClick={() => cameraInput.current?.click()}>
          <Camera size={17} /> Take photo
        </button>}
        {!videoOnly && <button type="button" className="btn-secondary" disabled={isUploading} onClick={() => galleryInput.current?.click()}>
          <ImagePlus size={17} /> Choose photo
        </button>}
        {allowVideo && <button type="button" className="btn-secondary" disabled={isUploading} onClick={() => videoInput.current?.click()}>
          <Video size={17} /> Choose video
        </button>}
        {isUploading && <span role="status" style={{ alignSelf: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>Uploading...</span>}
      </div>
      {error && <p role="alert" style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.4rem' }}>{error}</p>}
      {value && (
        <div style={{ position: 'relative', width: 'fit-content', marginTop: '0.65rem' }}>
          {(videoOnly || (allowVideo && /\.(mp4|webm|mov)(?:$|\?)/i.test(value)))
            ? <video src={value} controls playsInline aria-label="Selected issue video" style={{ display: 'block', maxWidth: '100%', width: 'min(320px, 70vw)', maxHeight: '180px', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)' }} />
            : <img src={value} alt="Selected issue evidence" style={{ display: 'block', maxWidth: '100%', width: 'min(320px, 70vw)', maxHeight: '180px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)' }} />}
          <button type="button" aria-label="Remove evidence" title="Remove evidence" onClick={() => onChange('')} style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', display: 'grid', placeItems: 'center', width: '32px', height: '32px', border: 0, borderRadius: '50%', color: 'white', background: 'rgba(0,0,0,0.75)', cursor: 'pointer' }}>
            <X size={17} />
          </button>
        </div>
      )}
      <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem' }}>{videoOnly ? 'Required: MP4, WebM, or MOV up to 12 MB.' : allowVideo ? 'JPEG, PNG, or WebP up to 8 MB; MP4, WebM, or MOV up to 12 MB.' : 'JPEG, PNG, or WebP; maximum 8 MB.'}</p>
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