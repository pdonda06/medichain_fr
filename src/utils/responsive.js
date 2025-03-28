/**
 * Responsive utility functions for consistent responsive design across the application
 */

// Standard breakpoints (px)
export const breakpoints = {
  xs: 0,    // Extra small devices (phones)
  sm: 600,  // Small devices (tablets)
  md: 960,  // Medium devices (small laptops)
  lg: 1280, // Large devices (laptops/desktops)
  xl: 1920  // Extra large devices (large desktops)
};

// Get CSS media query string for a specific breakpoint
export const mediaQuery = {
  up: (key) => `@media (min-width: ${breakpoints[key]}px)`,
  down: (key) => `@media (max-width: ${breakpoints[key] - 0.05}px)`,
  between: (start, end) => 
    `@media (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 0.05}px)`,
  only: (key) => {
    if (key === 'xl') {
      return mediaQuery.up('xl');
    }
    
    const nextKey = Object.keys(breakpoints).find(
      (k, i, keys) => k === key && keys[i + 1]
    );
    
    return nextKey
      ? mediaQuery.between(key, nextKey)
      : mediaQuery.up(key);
  }
};

// Device type detection based on screen width
export const isDevice = {
  mobile: () => window.innerWidth < breakpoints.sm,
  tablet: () => window.innerWidth >= breakpoints.sm && window.innerWidth < breakpoints.md,
  desktop: () => window.innerWidth >= breakpoints.md,
  largeDesktop: () => window.innerWidth >= breakpoints.lg
};

// Convert px to rem (assuming base font size of 16px)
export const pxToRem = (px) => `${px / 16}rem`;

// Get font size based on device type
export const getFontSize = (basePx, customSizes = {}) => {
  const width = window.innerWidth;
  const defaultSizes = {
    xs: basePx * 0.85,   // Smaller on mobile
    sm: basePx * 0.9,    // Slightly smaller on tablets 
    md: basePx,          // Base size on small laptops
    lg: basePx * 1.1,    // Slightly larger on desktops
    xl: basePx * 1.2     // Larger on big screens
  };
  
  const sizes = { ...defaultSizes, ...customSizes };
  
  if (width < breakpoints.sm) return pxToRem(sizes.xs);
  if (width < breakpoints.md) return pxToRem(sizes.sm);
  if (width < breakpoints.lg) return pxToRem(sizes.md);
  if (width < breakpoints.xl) return pxToRem(sizes.lg);
  return pxToRem(sizes.xl);
};

// Get spacing (margin/padding) value based on device type
export const getSpacing = (baseSpacing, customSpacing = {}) => {
  const width = window.innerWidth;
  const defaultSpacing = {
    xs: baseSpacing * 0.75, // Smaller on mobile
    sm: baseSpacing * 0.875, // Slightly smaller on tablets
    md: baseSpacing,        // Base spacing on small laptops
    lg: baseSpacing * 1.25, // Larger on desktops
    xl: baseSpacing * 1.5   // Larger on big screens
  };
  
  const spacing = { ...defaultSpacing, ...customSpacing };
  
  if (width < breakpoints.sm) return spacing.xs;
  if (width < breakpoints.md) return spacing.sm;
  if (width < breakpoints.lg) return spacing.md;
  if (width < breakpoints.xl) return spacing.lg;
  return spacing.xl;
};

// Check if device is in portrait or landscape orientation
export const isOrientation = {
  portrait: () => window.matchMedia('(orientation: portrait)').matches,
  landscape: () => window.matchMedia('(orientation: landscape)').matches
}; 