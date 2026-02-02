import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive media queries
 * @param {string} query - CSS media query (e.g., '(max-width: 1023px)')
 * @returns {boolean} - Whether the media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 1023px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Initial value is set in useState, no need to set here explicitly causing warning

    // Create listener for changes
    const listener = () => setMatches(media.matches);

    // Add event listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

// Common breakpoint helpers
export const useIsMobile = () => useMediaQuery('(max-width: 1023px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
