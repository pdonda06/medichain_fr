import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import useResponsive from '../hooks/useResponsive';

/**
 * A wrapper component that provides enhanced responsiveness for mobile devices
 * Can be wrapped around any component to make it more responsive on phones
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {Object} props.sx - Additional styling for the Box component
 * @param {string} props.component - Component type for the Box component
 * @param {boolean} props.disablePadding - Whether to disable padding on mobile
 * @param {boolean} props.disableScaling - Whether to disable text scaling on mobile
 * @param {number} props.mobileMaxWidth - Maximum width for mobile view (defaults to 100%)
 * @returns {React.ReactElement}
 */
const MobileResponsiveWrapper = ({ 
  children, 
  sx = {}, 
  component = 'div',
  disablePadding = false,
  disableScaling = false,
  mobileMaxWidth = '100%',
  ...props 
}) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();
  
  // Base padding values by device type
  const getPadding = () => {
    if (disablePadding) return 0;
    if (isMobile) return 1.5;
    if (isTablet) return 2;
    return 2.5;
  };

  // Apply mobile-specific styles
  const getMobileStyles = () => {
    if (!isMobile) return {};
    
    return {
      // Font size scaling
      '& h1, & .MuiTypography-h1': { fontSize: '1.8rem !important' },
      '& h2, & .MuiTypography-h2': { fontSize: '1.5rem !important' },
      '& h3, & .MuiTypography-h3': { fontSize: '1.3rem !important' },
      '& h4, & .MuiTypography-h4': { fontSize: '1.2rem !important' },
      '& h5, & .MuiTypography-h5': { fontSize: '1.1rem !important' },
      '& h6, & .MuiTypography-h6': { fontSize: '1rem !important' },
      
      // Button and form control sizing
      '& .MuiButton-root': { 
        minWidth: 'auto !important',
        padding: '8px 12px !important',
        fontSize: '0.875rem !important'
      },
      
      // Form field adjustments
      '& .MuiFormControl-root': { width: '100% !important' },
      '& .MuiInputBase-root': { fontSize: '0.9rem !important' },
      
      // Table adjustments
      '& .MuiTable-root': { 
        display: 'block !important',
        overflowX: 'auto !important',
        '& th, & td': { 
          padding: '8px !important',
          fontSize: '0.8rem !important' 
        }
      },
      
      // Card adjustments
      '& .MuiCard-root': { borderRadius: '8px !important' },
      '& .MuiCardContent-root': { padding: '12px !important' },
      
      // Grid adjustments
      '& .MuiGrid-container': { 
        rowGap: '16px !important',
      },
      
      // Dialog adjustments
      '& .MuiDialog-paper': { 
        margin: '16px !important',
        width: 'calc(100% - 32px) !important'
      }
    };
  };

  return (
    <Box
      component={component}
      sx={{
        width: '100%',
        maxWidth: isMobile ? mobileMaxWidth : '100%',
        padding: disablePadding ? 0 : getPadding(),
        ...(disableScaling ? {} : getMobileStyles()),
        overflowX: 'hidden', // Prevent horizontal scrolling on mobile
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default MobileResponsiveWrapper; 