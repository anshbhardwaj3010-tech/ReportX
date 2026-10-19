/**
 * Cloudinary Media Acceleration & Optimization Utility
 * Automatically serves responsive, ultra-compressed WebP/AVIF images
 * and video posters with smart cropping and auto-quality.
 */

const CLOUDINARY_REGEX = /https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video)\/upload\/(?:v\d+\/)?(.+)/;

export const isCloudinaryUrl = (url) => {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
};

/**
 * Generates an optimized Cloudinary delivery URL with automatic format and quality compression.
 * @param {string} url - Original image/video URL
 * @param {Object} options - Transformation options (width, height, crop, quality)
 * @returns {string} - Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return '';
  
  if (!isCloudinaryUrl(url)) {
    // If relative path like /uploads/..., let browser or API server resolve it
    return url;
  }

  const {
    width = 800,
    height,
    crop = 'limit',
    quality = 'auto',
    format = 'auto'
  } = options;

  const match = url.match(CLOUDINARY_REGEX);
  if (!match) return url;

  const [, cloudName, resourceType, publicIdWithExt] = match;
  
  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    crop ? `c_${crop}` : null
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transforms}/${publicIdWithExt}`;
};

/**
 * Generates a fast thumbnail for issue cards, map popups, and preview lists.
 */
export const getThumbnailUrl = (url, width = 400, height = 300) => {
  return getOptimizedImageUrl(url, {
    width,
    height,
    crop: 'fill',
    quality: 'auto'
  });
};

/**
 * For Cloudinary video URLs, generates an instant lightweight JPEG poster frame.
 */
export const getVideoPosterUrl = (videoUrl) => {
  if (!videoUrl || !isCloudinaryUrl(videoUrl)) return '';
  const cleanUrl = videoUrl.replace(/\.(mp4|webm|mov)(\?.*)?$/i, '.jpg');
  return getOptimizedImageUrl(cleanUrl, {
    width: 600,
    crop: 'limit',
    quality: 'auto'
  });
};
