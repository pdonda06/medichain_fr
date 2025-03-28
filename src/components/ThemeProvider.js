import { useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

/**
 * Custom ThemeProvider with enhanced mobile responsiveness
 * 
 * @param {Object} props - Component props 
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Define the theme with responsive values
  const baseTheme = useMemo(
    () =>
      createTheme({
        breakpoints: {
          values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
          },
        },
        palette: {
          mode: 'light',
          primary: {
            main: '#1976d2',
            light: '#4791db',
            dark: '#115293',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#f50057',
            light: '#ff4081',
            dark: '#c51162',
            contrastText: '#ffffff',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          success: {
            main: '#4caf50',
            light: '#80e27e',
            dark: '#087f23',
          },
          warning: {
            main: '#ff9800',
            light: '#ffc947',
            dark: '#c66900',
          },
          error: {
            main: '#f44336',
            light: '#ff7961',
            dark: '#ba000d',
          },
        },
        typography: {
          fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
          h1: {
            fontWeight: 600,
            fontSize: '2.5rem',
            '@media (max-width:600px)': {
              fontSize: '2rem',
            },
          },
          h2: {
            fontWeight: 600,
            fontSize: '2rem',
            '@media (max-width:600px)': {
              fontSize: '1.75rem',
            },
          },
          h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            '@media (max-width:600px)': {
              fontSize: '1.5rem',
            },
          },
          h4: {
            fontWeight: 500,
            fontSize: '1.5rem',
            '@media (max-width:600px)': {
              fontSize: '1.25rem',
            },
          },
          h5: {
            fontWeight: 500,
            fontSize: '1.25rem',
            '@media (max-width:600px)': {
              fontSize: '1.1rem',
            },
          },
          h6: {
            fontWeight: 500,
            fontSize: '1.1rem',
            '@media (max-width:600px)': {
              fontSize: '1rem',
            },
          },
          subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
          },
          subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          body1: {
            fontSize: '1rem',
            '@media (max-width:600px)': {
              fontSize: '0.9rem',
            },
          },
          body2: {
            fontSize: '0.875rem',
            '@media (max-width:600px)': {
              fontSize: '0.85rem',
            },
          },
          caption: {
            fontSize: '0.75rem',
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 8,
        },
        spacing: 8,
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              '@media (max-width:600px)': {
                html: {
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitOverflowScrolling: 'touch',
                },
              },
            },
          },
          MuiContainer: {
            styleOverrides: {
              root: {
                paddingLeft: 16,
                paddingRight: 16,
                '@media (min-width: 600px)': {
                  paddingLeft: 24,
                  paddingRight: 24,
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                '@media (max-width:600px)': {
                  borderRadius: 12, // slightly larger radius on mobile for better touch feel
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                '@media (max-width:600px)': {
                  borderRadius: 12,
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                fontWeight: 500,
                padding: '8px 16px',
                '@media (max-width:600px)': {
                  padding: '10px 16px', // larger touch target on mobile
                  borderRadius: 8,
                  minHeight: 42,
                },
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                },
              },
            },
            defaultProps: {
              disableElevation: true,
            },
          },
          MuiButtonBase: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  '&:focus': {
                    outline: 'none',
                  },
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  padding: 12, // larger touch target
                },
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  fontSize: '16px', // prevents iOS zoom on focus
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                  },
                },
              },
            },
          },
          MuiFormControl: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  marginBottom: 16,
                },
              },
            },
          },
          MuiTableContainer: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  borderRadius: 12,
                  overflowX: 'auto',
                  '-webkit-overflow-scrolling': 'touch',
                },
              },
            },
          },
          MuiTable: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  '& th, & td': {
                    padding: '12px 8px',
                  },
                },
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                '@media (max-width:600px)': {
                  margin: 24,
                  width: 'calc(100% - 48px)',
                  maxWidth: '100%',
                  borderRadius: 12,
                },
              },
            },
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  padding: 16,
                },
              },
            },
          },
          MuiDialogContent: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  padding: 16,
                },
              },
            },
          },
          MuiDialogActions: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  padding: '8px 16px 16px',
                },
              },
            },
          },
          MuiBottomNavigation: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  height: 56,
                },
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              root: {
                '@media (max-width:600px)': {
                  padding: 9,
                },
              },
              thumb: {
                '@media (max-width:600px)': {
                  width: 14,
                  height: 14,
                },
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                borderRadius: 4,
                fontSize: '0.75rem',
                padding: '8px 12px',
              },
            },
          },
        },
      }),
    []
  );

  // Apply responsive font sizes
  const theme = responsiveFontSizes(baseTheme);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}; 