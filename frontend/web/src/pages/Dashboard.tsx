import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Card, CardContent, Alert, CircularProgress, Chip, LinearProgress
} from '@mui/material';
import { Scorecard } from '../types';
import { api } from '../api/client';
import { ScorecardCard } from '../components/ScorecardCard';
import { getVerdictFromTotal, getLevelLabel } from '../constants';
import { buildDecisionProfile, buildCategoryAnalytics } from '../lib/analytics';

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
        ? Math.round(scorecards.reduce((sum, s) => sum + (s.totalScore || 0), 0) / scorecards.length)
        : 0;
    const avgVerdict = getVerdictFromTotal(avgScore);
    const profile = buildDecisionProfile(scorecards);
    const categoryAnalytics = buildCategoryAnalytics(scorecards);

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
                    + New Audit
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
                                sx={{ color: avgVerdict.color, fontFamily: '"JetBrains Mono", monospace' }}
                            >
                                {avgScore > 0 ? `+${avgScore}` : avgScore}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Average Score
                            </Typography>
                            <Typography variant="caption" sx={{ color: avgVerdict.color, fontWeight: 600 }}>
                                {avgVerdict.icon} {avgVerdict.label}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight={700} sx={{ color: avgVerdict.color }}>
                                {avgVerdict.icon}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {avgVerdict.description.split('.')[0]}.
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {profile && (
                <Card sx={{ mb: 4, bgcolor: '#f8f7ff', border: '1px solid #6366F120' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={700}>
                                🧠 Your Decision Profile
                            </Typography>
                            <Chip label={profile.profileType} color="primary" sx={{ fontWeight: 600 }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {profile.profileDescription}
                        </Typography>

                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Pillar Averages Across All Decisions
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            {profile.pillarAverages.map(p => {
                                const levelInfo = getLevelLabel(p.level);
                                const normalizedValue = ((p.avg + 1) / 2) * 100;
                                return (
                                    <Box key={p.pillarId} sx={{ mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                            <Typography variant="body2" fontWeight={500}>{p.pillarName}</Typography>
                                            <Chip
                                                label={`${levelInfo.icon} ${p.avg > 0 ? '+' : ''}${p.avg}`}
                                                size="small"
                                                sx={{ bgcolor: `${levelInfo.color}20`, color: levelInfo.color, fontWeight: 600, fontSize: '0.75rem' }}
                                            />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.max(5, Math.min(100, normalizedValue))}
                                            sx={{
                                                height: 8, borderRadius: 4,
                                                bgcolor: '#E4E4E7',
                                                '& .MuiLinearProgress-bar': { bgcolor: levelInfo.color, borderRadius: 4 }
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>

                        {(profile.strengths.length > 0 || profile.weaknesses.length > 0) && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
                                {profile.strengths.length > 0 && (
                                    <Box sx={{ p: 2, bgcolor: '#10B98115', borderRadius: 1, border: '1px solid #10B98130' }}>
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#10B981', mb: 1 }}>
                                            💪 Strengths
                                        </Typography>
                                        {profile.strengths.map((s, i) => (
                                            <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {s}</Typography>
                                        ))}
                                    </Box>
                                )}
                                {profile.weaknesses.length > 0 && (
                                    <Box sx={{ p: 2, bgcolor: '#EF444415', borderRadius: 1, border: '1px solid #EF444430' }}>
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#EF4444', mb: 1 }}>
                                            🎯 Areas to Improve
                                        </Typography>
                                        {profile.weaknesses.map((w, i) => (
                                            <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {w}</Typography>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        )}

                        {profile.dominantEmotions.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Most Frequent Emotions When Deciding
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {profile.dominantEmotions.map(e => (
                                        <Chip
                                            key={e.emotionId}
                                            label={`${e.icon} ${e.label} (${e.count}x)`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {categoryAnalytics.length > 1 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        📊 Category Comparison
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        See where you make stronger decisions and where you need more work.
                    </Typography>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: `repeat(${Math.min(categoryAnalytics.length, 3)}, 1fr)` },
                        gap: 2
                    }}>
                        {[...categoryAnalytics].sort((a, b) => b.avgScore - a.avgScore).map(cat => {
                            const catVerdict = getVerdictFromTotal(Math.round(cat.avgScore));
                            return (
                                <Card key={cat.category} sx={{ border: `1px solid ${catVerdict.color}30` }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {cat.icon} {cat.label}
                                            </Typography>
                                            <Chip
                                                label={`${catVerdict.icon} ${cat.avgScore > 0 ? '+' : ''}${cat.avgScore}`}
                                                size="small"
                                                sx={{ bgcolor: `${catVerdict.color}20`, color: catVerdict.color, fontWeight: 700 }}
                                            />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {cat.count} decision{cat.count !== 1 ? 's' : ''} · {catVerdict.label}
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            {cat.strongestPillar && (
                                                <Typography variant="caption" sx={{ display: 'block', color: '#10B981' }}>
                                                    ✅ Best: {cat.strongestPillar}
                                                </Typography>
                                            )}
                                            {cat.weakestPillar && cat.weakestPillar !== cat.strongestPillar && (
                                                <Typography variant="caption" sx={{ display: 'block', color: '#EF4444' }}>
                                                    ⚠️ Weakest: {cat.weakestPillar}
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
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
