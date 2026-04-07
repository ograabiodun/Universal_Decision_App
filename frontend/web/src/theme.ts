import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: { main: '#6366F1', light: '#818CF8', dark: '#4F46E5' },
        secondary: { main: '#8B5CF6' },
        success: { main: '#10B981' },
        warning: { main: '#F59E0B' },
        error: { main: '#EF4444' },
        background: {
            default: '#FAFAFA',
            paper: '#FFFFFF'
        },
        text: {
            primary: '#18181B',
            secondary: '#71717A'
        }
    },
    typography: {
        fontFamily: '"Inter", -apple-system, "Segoe UI", Roboto, sans-serif',
        h4: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700 },
        h5: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
        h6: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 }
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                    padding: '8px 24px'
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }
            }
        }
    }
});
