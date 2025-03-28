import React, { useState, useEffect } from 'react';
import { Box, Button, Snackbar, Alert, Typography, IconButton, SwipeableDrawer } from '@mui/material';
import { Download, X, Smartphone } from 'lucide-react';

function InstallPWA() {
  const [promptInstall, setPromptInstall] = useState(null);
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [installInstructions, setInstallInstructions] = useState('');
  
  // Check if it's a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(mobile);
      
      // Set relevant instructions based on device
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        setInstallInstructions('Tap the Share button, then "Add to Home Screen"');
      } else if (/Android/i.test(navigator.userAgent)) {
        setInstallInstructions('Tap the menu button, then "Add to Home screen"');
      } else {
        setInstallInstructions('Click the install button in your browser address bar');
      }
    };
    
    checkMobile();
  }, []);

  useEffect(() => {
    console.log('InstallPWA component mounted - checking for PWA support');
    
    // Skip the prompt if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true ||
        localStorage.getItem('pwaInstalled') === 'true') {
      console.log('App is already installed, not showing installation prompt');
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired!', e);
      e.preventDefault();
      // Store the event for later use
      setPromptInstall(e);
      
      // Show after 3 seconds
      setTimeout(() => {
        setOpen(true);
      }, 3000);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if deferredPrompt already exists
    if (window.deferredPrompt) {
      console.log('Using existing deferredPrompt');
      setPromptInstall(window.deferredPrompt);
      setTimeout(() => {
        setOpen(true);
      }, 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const onInstallClick = () => {
    if (promptInstall) {
      console.log('Showing install prompt');
      // Show the native installation prompt
      promptInstall.prompt();
      
      // Wait for the user to respond to the prompt
      promptInstall.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          localStorage.setItem('pwaInstalled', 'true');
        } else {
          console.log('User dismissed the install prompt');
        }
        setPromptInstall(null);
        setOpen(false);
        window.deferredPrompt = null;
      });
    } else {
      // If no prompt is available but it's mobile, show manual instructions
      if (isMobile) {
        setDrawerOpen(true);
      } else {
        console.log('No install prompt available');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Don't show anything if already in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    return null;
  }

  return (
    <>
      <Snackbar 
        open={open} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert 
          severity="info" 
          elevation={6} 
          sx={{ 
            width: '100%', 
            maxWidth: 'sm',
            alignItems: 'center',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
          onClose={handleClose}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
            gap: 1
          }}>
            <Box>
              <Typography variant="body1" fontWeight={500}>
                Install MediChain App
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isMobile ? 'For faster access and offline use' : 'Install for desktop access'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Download size={16} />}
              onClick={onInstallClick}
            >
              Install
            </Button>
          </Box>
        </Alert>
      </Snackbar>

      {/* Floating action button for mobile installation */}
      {isMobile && !open && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 999 
          }}
        >
          <IconButton 
            color="primary" 
            sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              width: 56,
              height: 56,
              boxShadow: 3
            }}
            onClick={() => onInstallClick()}
          >
            <Smartphone size={24} />
          </IconButton>
        </Box>
      )}

      {/* Manual installation instructions for iOS and other browsers */}
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        disableSwipeToOpen
      >
        <Box sx={{ p: 2, pt: 3, pb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Install MediCare App</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <X size={20} />
            </IconButton>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {installInstructions}
          </Typography>
          
          {/iPhone|iPad|iPod/i.test(navigator.userAgent) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box component="img" src="/ios-share-icon.png" alt="Share icon" sx={{ width: 24, height: 24, mr: 1 }} />
              <Typography>Tap the Share icon, then scroll down</Typography>
            </Box>
          )}
          
          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => setDrawerOpen(false)} 
            sx={{ mt: 2 }}
          >
            Got it
          </Button>
        </Box>
      </SwipeableDrawer>
    </>
  );
}

export default InstallPWA; 