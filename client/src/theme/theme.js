import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4285f4', // GeekSuite theme blue
      light: '#7dabf7',
      dark: '#2c5499',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1976D2',
      light: '#2196F3',
      dark: '#1565C0',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#f5f5f5', // Very light grey for view background
      paper: '#ffffff',
      codeEditor: '#f5f5f5',
      mindMap: '#f8f9fa',
    },
    error: {
      main: '#B00020',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFC107',
    },
    info: {
      main: '#2196F3',
    },
    text: {
      primary: '#333333', // Dark grey for text
      secondary: '#666666',
      disabled: '#BDBDBD',
      placeholder: 'rgba(117, 117, 117, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
    code: {
      fontFamily: '"Roboto Mono", monospace',
      fontSize: '0.9rem',
    },
  },
  spacing: 8, // Base spacing unit of 8px
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          height: 64, // Standard header height
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(96, 152, 204, 0.04)',
          },
          '&.Mui-disabled': {
            opacity: 0.38,
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1), 0px 4px 5px 0px rgba(0,0,0,0.07), 0px 1px 10px 0px rgba(0,0,0,0.06)',
          '&:hover': {
            boxShadow: '0px 4px 8px -2px rgba(0,0,0,0.1), 0px 6px 7px 0px rgba(0,0,0,0.07), 0px 2px 12px 0px rgba(0,0,0,0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 220,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(96, 152, 204, 0.1)',
          color: '#6098CC',
          '&:hover': {
            backgroundColor: 'rgba(96, 152, 204, 0.2)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64, // Match header height
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#666666', // Dark grey for inactive icons
          '&.Mui-selected': {
            color: '#4285f4', // Theme blue for active icon
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;