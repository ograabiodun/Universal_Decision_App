import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewScorecard } from './pages/NewScorecard';
import { ScorecardDetail } from './pages/ScorecardDetail';
import { About } from './pages/About';

export const App: React.FC = () => {
    const { user, loading, login, loginAsGuest, logout, isGuest } = useAuth();

    if (loading) return null;

    if (!user) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Login onLogin={login} onGuest={loginAsGuest} />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Layout user={user} onLogout={logout} isGuest={isGuest}>
                    <Routes>
                        <Route path="/" element={<Dashboard isGuest={isGuest} />} />
                        <Route path="/new" element={<NewScorecard />} />
                        <Route path="/scorecard/:id" element={<ScorecardDetail />} />
                        <Route path="/about" element={<About />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </ThemeProvider>
    );
};
