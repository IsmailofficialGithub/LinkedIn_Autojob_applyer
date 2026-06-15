import { createTheme } from '@mui/material/styles'

export const createMuiTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#2563eb',
      },
      background: {
        default: mode === 'dark' ? '#020617' : '#f8fafc',
        paper: mode === 'dark' ? '#0f172a' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
        secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
    },
  })
