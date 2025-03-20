import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Divider, IconButton, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import useResponsive from '../hooks/useResponsive';
import { useSwipe } from '../utils/touchUtils';

/**
 * MobileView Component - Displays content in a mobile-friendly way
 * Adds swipe gestures and optimizations for small screens
 */
const MobileView = ({
  title,
  children,
  onClose,
  onBack,
  onNext,
  fullScreen = false,
  hideControls = false,
  swipeable = true,
  headerActions = null,
  footer = null,
  contentPadding = 2,
  elevation = 2,
  maxHeight = '100vh',
  backgroundColor = 'background.paper'
}) => {
  const theme = useTheme();
  const { isMobile, orientation } = useResponsive();
  const contentRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track scroll position
  useEffect(() => {
    if (!contentRef.current) return;
    
    const trackScroll = () => {
      setScrollPosition(contentRef.current.scrollTop);
      
      // Hide controls when scrolling down, show when at top
      if (contentRef.current.scrollTop > 50 && showControls) {
        setShowControls(false);
      } else if (contentRef.current.scrollTop < 20 && !showControls) {
        setShowControls(true);
      }
    };
    
    contentRef.current.addEventListener('scroll', trackScroll);
    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('scroll', trackScroll);
      }
    };
  }, [showControls]);

  // Setup swipe handling
  const { touchProps } = useSwipe({
    onSwipeLeft: onNext,
    onSwipeRight: onBack,
    onSwipeDown: () => {
      // Only allow swipe down to close when at the top of content
      if (scrollPosition < 10 && onClose) {
        onClose();
      }
    },
    minDistance: 50,
    disabled: !swipeable || !isMobile
  });

  return (
    <Paper
      elevation={elevation}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: fullScreen ? '100vh' : 'auto',
        maxHeight: maxHeight,
        overflow: 'hidden',
        backgroundColor,
        borderRadius: isMobile ? (fullScreen ? 0 : 2) : 2,
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
      }}
      {...(swipeable && isMobile ? touchProps : {})}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          opacity: hideControls ? (showControls ? 1 : 0) : 1,
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        <Box display="flex" alignItems="center" flex={1}>
          {onBack && (
            <IconButton
              onClick={onBack}
              edge="start"
              sx={{ mr: 1 }}
              aria-label="back"
              size={isMobile ? 'small' : 'medium'}
            >
              <ChevronLeft size={isMobile ? 20 : 24} />
            </IconButton>
          )}
          
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            component="h2"
            sx={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center">
          {headerActions}
          
          {onNext && (
            <IconButton
              onClick={onNext}
              aria-label="next"
              size={isMobile ? 'small' : 'medium'}
            >
              <ChevronRight size={isMobile ? 20 : 24} />
            </IconButton>
          )}
          
          {onClose && (
            <IconButton
              onClick={onClose}
              edge="end"
              aria-label="close"
              size={isMobile ? 'small' : 'medium'}
              sx={{ ml: headerActions ? 1 : 0 }}
            >
              <X size={isMobile ? 20 : 24} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box
        ref={contentRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: contentPadding,
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.action.hover,
            borderRadius: '3px',
          },
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      {footer && (
        <>
          <Divider />
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`,
              position: 'sticky',
              bottom: 0,
              width: '100%',
            }}
          >
            {footer}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default MobileView; 