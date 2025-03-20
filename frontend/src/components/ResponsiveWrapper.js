import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

/**
 * A responsive wrapper component that adapts content layout based on screen size
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {Object} props.sx - Additional styling for the Box component
 * @param {string} props.component - Component type for the Box component
 * @param {Object} props.spacing - Customized spacing for different breakpoints
 * @param {Object} props.maxWidth - Maximum width at different breakpoints
 * @returns {React.ReactElement}
 */
const ResponsiveWrapper = ({ 
  children, 
  sx = {}, 
  component = 'div', 
  spacing = {}, 
  maxWidth = {},
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLaptop = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Default spacing values based on screen size
  const defaultSpacing = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    ...spacing
  };

  // Default max width values based on screen size
  const defaultMaxWidth = {
    xs: '100%',
    sm: '100%',
    md: '90%',
    lg: '1200px',
    ...maxWidth
  };

  // Get appropriate spacing based on screen size
  const getSpacing = () => {
    if (isMobile) return defaultSpacing.xs;
    if (isTablet) return defaultSpacing.sm;
    if (isLaptop) return defaultSpacing.md;
    if (isDesktop) return defaultSpacing.lg;
    return defaultSpacing.md;
  };

  // Get appropriate width based on screen size
  const getMaxWidth = () => {
    if (isMobile) return defaultMaxWidth.xs;
    if (isTablet) return defaultMaxWidth.sm;
    if (isLaptop) return defaultMaxWidth.md;
    if (isDesktop) return defaultMaxWidth.lg;
    return defaultMaxWidth.md;
  };

  return (
    <Box
      component={component}
      sx={{
        width: '100%',
        maxWidth: getMaxWidth(),
        mx: 'auto',
        p: getSpacing(),
        boxSizing: 'border-box',
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveWrapper; 