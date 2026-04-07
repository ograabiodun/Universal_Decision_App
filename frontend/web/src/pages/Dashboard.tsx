import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Card, CardContent, Alert, CircularProgress
} from '@mui/material';
import { Scorecard } from '../types';
import { api } from '../api/client';
import { ScorecardCard } from '../components/ScorecardCard';
import { getScorePercent, getVerdictFromScore } from '../constants';

interface DashboardProps {
    isGuest: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ isGuest }) => {
    const navigate = useNavigate();
    const [scorecards, setScorecards] = useState<Scorecard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isGuest) {
            setLoading(false);
            return;
        }
        loadScorecards();
    }, [isGuest]);

    const loadScorecards = async () => {
        try {
            const data = await api.getScorecards();
            setScorecards(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const avgScore = scorecards.length > 0
        ? scorecards.reduce((sum, s) => sum + (s.weightedScore || 0), 0) / scorecards.length
        : 0;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track and improve your decision-making
                    </Typography>
                </Box>
                <Button variant="contained" onClick={() => navigate('/new')} size="large">
                    + New Scorecard
                </Button>
            </Box>

            {!isGuest && scorecards.length > 0 && (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 2, mb: 4
                }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight={700} color="primary">
                                {scorecards.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Decisions
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h3"
                                fontWeight={700}
                                sx={{ color: getVerdictFromScore(avgScore).color }}
                            >
                                {getScorePercent(avgScore)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Average Score
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight={700} color="secondary">
                                {getVerdictFromScore(avgScore).icon}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {getVerdictFromScore(avgScore).label} Average
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!loading && isGuest && (
                <Card sx={{ textAlign: 'center', py: 6 }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ mb: 1 }}>👋 Welcome, Guest</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            You can create scorecards, but sign in with email to save and track your history.
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/new')} size="large">
                            Create Your First Scorecard
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!loading && !isGuest && scorecards.length === 0 && !error && (
                <Card sx={{ textAlign: 'center', py: 6 }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ mb: 1 }}>📋 No scorecards yet</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Start auditing your decisions to build better habits.
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/new')} size="large">
                            Create Your First Scorecard
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!loading && scorecards.length > 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>Recent Scorecards</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {scorecards.map(sc => (
                            <ScorecardCard
                                key={sc.id}
                                scorecard={sc}
                                onClick={() => navigate(`/scorecard/${sc.id}`)}
                            />
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};
