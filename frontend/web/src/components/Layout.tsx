import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Tooltip, PaletteMode
} from '@mui/material';
import { AuthUser } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    user: AuthUser | null;
    onLogout: () => void;
    isGuest: boolean;
    themeMode: PaletteMode;
    onToggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, isGuest, themeMode, onToggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="sticky" elevation={0}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        sx={{ cursor: 'pointer', flexGrow: 0, mr: 4 }}
                        onClick={() => navigate('/')}
                    >
                        💡 ClarityPro
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/')}
                            sx={{ opacity: location.pathname === '/' ? 1 : 0.7 }}
                        >
                            Dashboard
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/new')}
                            sx={{ opacity: location.pathname === '/new' ? 1 : 0.7 }}
                        >
                            New Scorecard
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/about')}
                            sx={{ opacity: location.pathname === '/about' ? 1 : 0.7 }}
                        >
                            About
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                            <IconButton color="inherit" onClick={onToggleTheme} size="small" sx={{ opacity: 0.85 }}>
                                <Typography fontSize="1.2rem">{themeMode === 'light' ? '🌙' : '☀️'}</Typography>
                            </IconButton>
                        </Tooltip>
                        {user && !isGuest && (
                            <Typography variant="body2" sx={{ opacity: 0.9, ml: 1 }}>
                                {user.email}
                            </Typography>
                        )}
                        {isGuest && (
                            <Typography variant="body2" sx={{ opacity: 0.7, ml: 1 }}>
                                Guest
                            </Typography>
                        )}
                        <Button color="inherit" size="small" onClick={onLogout} sx={{ opacity: 0.8 }}>
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ py: 4 }}>
                {children}
            </Container>
        </Box>
    );
};
