import { createTheme, PaletteMode } from '@mui/material/styles';

const sharedTypography = {
    fontFamily: '"Inter", -apple-system, "Segoe UI", Roboto, sans-serif',
    h4: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 }
};

const sharedComponents = {
    MuiButton: {
        styleOverrides: {
            root: {
                textTransform: 'none' as const,
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
};

export const createAppTheme = (mode: PaletteMode) => createTheme({
    palette: {
        mode,
        primary: { main: '#0077B6', light: '#00A8E8', dark: '#005F8C' },
        secondary: { main: '#2E9B5F' },
        success: { main: '#10B981' },
        warning: { main: '#F59E0B' },
        error: { main: '#EF4444' },
        background: mode === 'light'
            ? { default: '#F7FAFB', paper: '#FFFFFF' }
            : { default: '#0F1419', paper: '#1A2332' },
        text: mode === 'light'
            ? { primary: '#18181B', secondary: '#5A6577' }
            : { primary: '#E8ECF1', secondary: '#8899AA' }
    },
    typography: sharedTypography,
    shape: { borderRadius: 12 },
    components: {
        ...sharedComponents,
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: mode === 'light'
                        ? '0 2px 8px rgba(0,0,0,0.08)'
                        : '0 2px 8px rgba(0,0,0,0.3)'
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: mode === 'light' ? '#0077B6' : '#0D2137'
                }
            }
        }
    }
});

// Theme-aware tint colors (for use in sx props)
export const tints = {
    light: {
        primaryBg: '#E8F4FD',
        primaryBorder: '#0077B620',
        secondaryBg: '#E6F5ED',
        secondaryBorder: '#2E9B5F20',
        accentBg: '#F0F7FF',
        subtleBg: '#f5f5f5'
    },
    dark: {
        primaryBg: '#0D2137',
        primaryBorder: '#0077B640',
        secondaryBg: '#0F2A1A',
        secondaryBorder: '#2E9B5F40',
        accentBg: '#111D2E',
        subtleBg: '#1A2332'
    }
};

// Legacy export for backwards compatibility
export const theme = createAppTheme('light');
