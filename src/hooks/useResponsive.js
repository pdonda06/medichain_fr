import { useMediaQuery, useTheme } from '@mui/material';
import { useMemo, useEffect, useState } from 'react';

/**
 * Custom hook for responsive design
 * @returns {Object} Responsive properties and helper functions
 */
const useResponsive = () => {
  const theme = useTheme();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Update window size state when resizing
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Device type breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  // Device categories
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  // Orientation detection
  const isPortrait = windowSize.height > windowSize.width;
  const isLandscape = windowSize.width > windowSize.height;

  // Touch detection
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    // Check if device has touch capability
    setIsTouch(('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0) || 
      (navigator.msMaxTouchPoints > 0));
  }, []);

  // Helper function to get appropriate spacing based on device size
  const getSpacing = (mobileSpacing, tabletSpacing, desktopSpacing) => {
    if (isMobile) return mobileSpacing;
    if (isTablet) return tabletSpacing;
    return desktopSpacing;
  };

  // Helper function to get appropriate font size based on device size
  const getFontSize = (mobileFontSize, tabletFontSize, desktopFontSize) => {
    if (isMobile) return mobileFontSize;
    if (isTablet) return tabletFontSize;
    return desktopFontSize;
  };

  // Memoize values to prevent unnecessary re-renders
  return useMemo(() => ({
    // Window properties
    windowWidth: windowSize.width,
    windowHeight: windowSize.height,
    
    // Breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Device categories
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    
    // Orientation
    isPortrait,
    isLandscape,
    
    // Touch capability
    isTouch,
    
    // Helper functions
    getSpacing,
    getFontSize,
    
    // Screen dimensions in breakpoint format
    screenSize: isMobile ? 'xs' : isTablet ? 'sm' : isMd ? 'md' : isLg ? 'lg' : 'xl',

    // Safe area insets for notched devices (iOS)
    safeAreaInsets: {
      top: 'env(safe-area-inset-top, 0px)',
      right: 'env(safe-area-inset-right, 0px)',
      bottom: 'env(safe-area-inset-bottom, 0px)',
      left: 'env(safe-area-inset-left, 0px)'
    }
  }), [
    windowSize.width, 
    windowSize.height,
    isXs, 
    isSm, 
    isMd, 
    isLg, 
    isXl,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    isPortrait,
    isLandscape,
    isTouch
  ]);
};

export default useResponsive; 