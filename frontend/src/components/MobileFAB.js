import React, { useState } from 'react';
import { 
  Fab, 
  Box, 
  Zoom, 
  Fade, 
  useScrollTrigger, 
  useTheme, 
  Typography,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import { Plus, X } from 'lucide-react';
import useResponsive from '../hooks/useResponsive';

/**
 * Mobile Floating Action Button (FAB)
 * Provides a touch-friendly floating button with optional speed dial actions
 */
const MobileFAB = ({
  color = 'primary',
  icon = <Plus />,
  onClick,
  label,
  position = { bottom: 16, right: 16 },
  actions = [],
  size = 'large',
  hideOnScroll = true,
  tooltip,
  expandOnHover = false,
  variant = 'circular',
  extended = false
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(false);
  
  // Hide on scroll functionality
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  // Determine if we should show the component
  const shouldShow = !hideOnScroll || !trigger;
  
  // Handle clicks on the main FAB
  const handleClick = (event) => {
    if (actions.length > 0) {
      setOpen(!open);
    } else if (onClick) {
      onClick(event);
    }
  };
  
  // Handle clicks on actions
  const handleActionClick = (action) => (event) => {
    setOpen(false);
    if (action.onClick) {
      action.onClick(event);
    }
  };

  // If there are no actions, render a simple FAB
  if (actions.length === 0) {
    return (
      <Zoom in={shouldShow}>
        <Box
          sx={{
            position: 'fixed',
            ...position,
            zIndex: theme.zIndex.speedDial,
          }}
        >
          <Fab
            aria-label={label || 'action'}
            color={color}
            size={size}
            variant={extended ? 'extended' : variant}
            onClick={handleClick}
          >
            {icon}
            {extended && (
              <Typography
                variant="button"
                sx={{ ml: 1, textTransform: 'none', fontWeight: 500 }}
              >
                {label}
              </Typography>
            )}
          </Fab>
        </Box>
      </Zoom>
    );
  }
  
  // Render a speed dial with actions
  return (
    <Fade in={shouldShow}>
      <Box
        sx={{
          position: 'fixed',
          ...position,
          zIndex: theme.zIndex.speedDial,
        }}
      >
        <SpeedDial
          ariaLabel={label || 'speed-dial'}
          icon={<SpeedDialIcon icon={icon} openIcon={<X />} />}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          direction={position.bottom !== undefined && position.top === undefined ? 'up' : 'down'}
          FabProps={{
            color,
            size,
            variant: variant === 'circular' ? 'circular' : 'extended',
          }}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipOpen={isMobile}
              onClick={handleActionClick(action)}
              FabProps={{
                color: action.color || 'default',
                size: action.size || 'small',
              }}
            />
          ))}
        </SpeedDial>
      </Box>
    </Fade>
  );
};

export default MobileFAB; 