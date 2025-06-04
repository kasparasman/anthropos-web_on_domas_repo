import { useEffect } from 'react';

export function usePreloadImages(urls: string[]) {
  useEffect(() => {
    urls.forEach(url => {
      if (!url) return;
      const img = new window.Image();
      img.src = url;
    });
  }, [urls]);
} 