import React, { useState } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button, Alert, Divider
} from '@mui/material';

interface LoginProps {
    onLogin: (email: string) => Promise<any>;
    onGuest: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onGuest }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError(null);
        try {
            await onLogin(email.trim().toLowerCase());
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

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                        )}

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            disabled={!email.trim() || loading}
                            size="large"
                        >
                            {loading ? 'Signing in...' : 'Continue with Email'}
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
                        Sign in to save and track your decision history.
                        Guest mode lets you create scorecards but cannot retrieve history.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};
