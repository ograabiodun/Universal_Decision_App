import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, Box, Container
} from '@mui/material';
import { AuthUser } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    user: AuthUser | null;
    onLogout: () => void;
    isGuest: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, isGuest }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'primary.main' }}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        sx={{ cursor: 'pointer', flexGrow: 0, mr: 4 }}
                        onClick={() => navigate('/')}
                    >
                        🎯 Decision Audit
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
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {user && !isGuest && (
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {user.email}
                            </Typography>
                        )}
                        {isGuest && (
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
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
