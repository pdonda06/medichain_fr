import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './components/ThemeProvider';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateFacility from './pages/CreateFacility';
import AddReport from './pages/AddReport';
import ViewReports from './pages/ViewReports';
import ManageDepartments from './pages/ManageDepartments';
import ManageUsers from './pages/ManageUsers';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import ViewReport from './pages/ViewReport';
import EditReport from './pages/EditReport';
import InstallPWA from './components/InstallPWA';
import MobileNavigation from './components/MobileNavigation';
import { useState, useEffect } from 'react';
import useResponsive from './hooks/useResponsive';
import { GlobalStyles } from '@mui/material';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isMobile, isTablet, isSmallScreen } = useResponsive();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Define global responsive styles
  const globalStyles = (
    <GlobalStyles 
      styles={(theme) => ({
        // Remove any default margins/paddings
        'body': {
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitOverflowScrolling: 'touch'
        },

        // Better mobile focus states
        '.MuiButtonBase-root:focus': {
          outline: 'none',
        },

        // Adjust form controls for touch targets
        ...(isMobile && {
          '.MuiButtonBase-root': {
            padding: '10px 16px',
            minHeight: '42px',
          },
          
          '.MuiFormControl-root': {
            margin: '0 0 16px 0',
          },

          '.MuiInputBase-root': {
            fontSize: '16px',  // Prevents zoom on focus in iOS
          },

          '.MuiInputLabel-root': {
            fontSize: '14px',
          },

          // Better tap targets
          '.MuiIconButton-root': {
            padding: '12px',
          },

          // Card and Paper adjustments
          '.MuiPaper-root, .MuiCard-root': {
            borderRadius: '8px',
          },

          // Typography adjustments
          '.MuiTypography-h1': { fontSize: '2rem' },
          '.MuiTypography-h2': { fontSize: '1.75rem' },
          '.MuiTypography-h3': { fontSize: '1.5rem' },
          '.MuiTypography-h4': { fontSize: '1.25rem' },
          '.MuiTypography-h5': { fontSize: '1.1rem' },
          '.MuiTypography-h6': { fontSize: '1rem' },
          '.MuiTypography-body1': { fontSize: '0.9rem' },
          '.MuiTypography-body2': { fontSize: '0.85rem' },

          // Table adjustments
          '.MuiTableContainer-root': {
            width: '100%',
            overflowX: 'auto',
            '-webkit-overflow-scrolling': 'touch',
          },
          
          // Adjust toasts for mobile
          '.Toastify__toast-container': {
            width: 'calc(100vw - 32px)',
            padding: '0',
            left: '16px',
            right: '16px',
          },
          '.Toastify__toast': {
            borderRadius: '8px',
            minHeight: 'auto',
            padding: '10px 16px',
          },
          '.Toastify__toast-body': {
            fontSize: '0.875rem',
          },
          
          // Responsive dialog fixes
          '.MuiDialog-paper': {
            margin: '24px',
            width: 'calc(100% - 48px)',
            maxWidth: '100%',
          },
          '.MuiDialogTitle-root': {
            padding: '16px',
          },
          '.MuiDialogContent-root': {
            padding: '16px',
          },
          '.MuiDialogActions-root': {
            padding: '8px 16px 16px',
          },
          
          // Fix bottom nav spacing
          '.MuiBottomNavigation-root': {
            height: '56px',
          }
        }),
        
        // Medium size screens
        ...(isTablet && {
          '.MuiContainer-root': {
            padding: '0 16px',
          }
        }),
        
        // PWA display fixes
        '@media (display-mode: standalone)': {
          'body': {
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }
        }
      })}
    />
  );

  return (
    <ThemeProvider>
      <CssBaseline />
      {globalStyles}
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          {!isOnline && (
            <Box 
              sx={{ 
                bgcolor: 'warning.main', 
                color: 'warning.contrastText', 
                p: 1, 
                textAlign: 'center',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              You are currently offline. Some features may be unavailable.
            </Box>
          )}
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Container 
              maxWidth="lg" 
              sx={{ 
                mt: { xs: 1, sm: 2 }, 
                mb: { xs: 2, sm: 4 },
                px: { xs: 1.5, sm: 3 },
                width: '100%'
              }}
            >
              <Box sx={{ py: { xs: 1, sm: 2 } }}>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/create-facility" element={<CreateFacility />} />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/add-report"
                    element={
                      <PrivateRoute>
                        <AddReport />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/view-reports"
                    element={
                      <PrivateRoute>
                        <ViewReports />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/manage-departments"
                    element={
                      <PrivateRoute>
                        <ManageDepartments />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/manage-users"
                    element={
                      <PrivateRoute>
                        <ManageUsers />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/report/:id"
                    element={
                      <PrivateRoute>
                        <ViewReport />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/edit-report/:id"
                    element={
                      <PrivateRoute>
                        <EditReport />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Box>
            </Container>
          </Box>
          <MobileNavigation />
        </Box>
      </Router>
      <InstallPWA />
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ 
          fontSize: isMobile ? '14px' : '16px',
          width: isMobile ? '90%' : undefined
        }}
        toastStyle={{
          borderRadius: '8px',
          maxWidth: isMobile ? '100%' : undefined,
        }}
      />
    </ThemeProvider>
  );
}

export default App; 