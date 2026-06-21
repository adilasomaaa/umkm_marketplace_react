import React, { useState, useEffect } from 'react';
import { Image as HeroImage } from '@heroui/react';
import type { ImageProps } from '@heroui/react';

const DEFAULT_IMAGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23a1a1aa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="background:%23f4f4f5;width:100%;height:100%"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" style="fill:%23fafafa;stroke:%23e4e4e7;stroke-width:1"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`;

const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23a1a1aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="background:%23e4e4e7;width:100%;height:100%"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

interface SafeImageProps extends ImageProps {
  fallbackType?: 'toko' | 'produk' | 'avatar';
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackType = 'produk',
  onError,
  ...props
}) => {
  const getDefaultFallback = () => {
    if (fallbackType === 'avatar') return DEFAULT_AVATAR_SVG;
    return DEFAULT_IMAGE_SVG;
  };

  const fallback = getDefaultFallback();

  // Helper function to check if the src string is invalid/empty/broken
  const getInitialSrc = (inputSrc: any): string => {
    if (!inputSrc || typeof inputSrc !== 'string') return fallback;
    const trimmed = inputSrc.trim();
    if (
      trimmed === '' ||
      trimmed.endsWith('/null') ||
      trimmed.endsWith('/undefined') ||
      trimmed === 'null' ||
      trimmed === 'undefined'
    ) {
      return fallback;
    }
    return trimmed;
  };

  const [imgSrc, setImgSrc] = useState<string>(getInitialSrc(src));

  // Sync state if src changes
  useEffect(() => {
    setImgSrc(getInitialSrc(src));
  }, [src]);

  const handleOnError = () => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
    if (onError) {
      onError();
    }
  };

  return <HeroImage src={imgSrc} onError={handleOnError} {...props} />;
};

export default SafeImage;
