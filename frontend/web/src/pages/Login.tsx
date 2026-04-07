import React, { useState } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button, Alert, Divider, ToggleButton, ToggleButtonGroup
} from '@mui/material';

interface LoginProps {
    onLogin: (email: string, password: string, mode: 'login' | 'register') => Promise<any>;
    onGuest: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onGuest }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password) return;

        setLoading(true);
        setError(null);
        try {
            await onLogin(email.trim().toLowerCase(), password, mode);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', bgcolor: '#f5f7fa', p: 2
        }}>
            <Card sx={{ maxWidth: 440, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" gutterBottom>🎯</Typography>
                        <Typography variant="h5" fontWeight={700}>
                            Decision Audit
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Score, track, and improve your decision-making
                        </Typography>
                    </Box>

                    <ToggleButtonGroup
                        value={mode}
                        exclusive
                        onChange={(_, v) => { if (v) { setMode(v); setError(null); } }}
                        fullWidth
                        size="small"
                        sx={{ mb: 3 }}
                    >
                        <ToggleButton value="login">Sign In</ToggleButton>
                        <ToggleButton value="register">Sign Up</ToggleButton>
                    </ToggleButtonGroup>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            type="email"
                            label="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            sx={{ mb: 2 }}
                            autoFocus
                        />

                        <TextField
                            fullWidth
                            type="password"
                            label="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                            sx={{ mb: 2 }}
                        />

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                        )}

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            disabled={!email.trim() || !password || password.length < 6 || loading}
                            size="large"
                        >
                            {loading ? (mode === 'register' ? 'Creating account...' : 'Signing in...') : (mode === 'register' ? 'Create Account' : 'Sign In')}
                        </Button>
                    </form>

                    <Divider sx={{ my: 3 }}>or</Divider>

                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={onGuest}
                        size="large"
                    >
                        Continue as Guest
                    </Button>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
                        {mode === 'register'
                            ? 'Create an account to save and track your decision history.'
                            : 'Sign in to access your saved scorecards. Guest mode lets you try the app without an account.'}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};
