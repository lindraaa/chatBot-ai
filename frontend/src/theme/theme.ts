import { createTheme } from '@mui/material/styles';

export const luxuryHotelTheme = createTheme({
  palette: {
    primary: {
      main: '#1a2332', // Deep navy
      light: '#2d3e5f',
      dark: '#0f1419',
    },
    secondary: {
      main: '#d4af37', // Gold accent
      light: '#e5c158',
      dark: '#9d8b2a',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2332',
      secondary: '#5a6c7d',
    },
    info: {
      main: '#4a90e2',
    },
    success: {
      main: '#52c77f',
    },
    warning: {
      main: '#f5a623',
    },
    error: {
      main: '#d0021b',
    },
  },
  typography: {
    fontFamily: [
      '"Playfair Display"',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '3.5rem',
      fontWeight: 600,
      letterSpacing: '-1px',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.5px',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0.3px',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.3px',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.2px',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 32px',
          fontSize: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1a2332 0%, #2d3e5f 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #d4af37 0%, #e5c158 100%)',
          color: '#1a2332',
          '&:hover': {
            background: 'linear-gradient(135deg, #c99d2e 0%, #d4af37 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(212, 175, 55, 0.1)',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            '&:hover fieldset': {
              borderColor: '#d4af37',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#d4af37',
              boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.1)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
