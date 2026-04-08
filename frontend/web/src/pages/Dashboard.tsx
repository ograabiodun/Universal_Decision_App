import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Card, CardContent, Alert, CircularProgress, Chip, LinearProgress,
    TextField, InputAdornment
} from '@mui/material';
import { Scorecard, ScorecardFilters, DecisionCategory } from '../types';
import { api } from '../api/client';
import { ScorecardCard } from '../components/ScorecardCard';
import { getVerdictFromTotal, getLevelLabel, categories } from '../constants';
import { buildDecisionProfile, buildCategoryAnalytics, detectPatterns } from '../lib/analytics';

interface DashboardProps {
    isGuest: boolean;
}

const verdictOptions = [
    { value: 'excellent', label: '🌟 Excellent' },
    { value: 'acceptable', label: '✅ Acceptable' },
    { value: 'borderline', label: '⚖️ Even Ground' },
    { value: 'poor', label: '🌱 Learning Moment' },
    { value: 'critical', label: '💪 Growth Opportunity' }
];

export const Dashboard: React.FC<DashboardProps> = ({ isGuest }) => {
    const navigate = useNavigate();
    const [scorecards, setScorecards] = useState<Scorecard[]>([]);
    const [allScorecards, setAllScorecards] = useState<Scorecard[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);

    // Filters
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterVerdict, setFilterVerdict] = useState<string>('');
    const [filterMode, setFilterMode] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchDebounce, setSearchDebounce] = useState<string>('');

    const LIMIT = 20;

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setSearchDebounce(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (isGuest) {
            setLoading(false);
            return;
        }
        // Reset pagination on filter change
        setPage(1);
        setScorecards([]);
        loadScorecards(1);
    }, [isGuest, filterCategory, filterVerdict, filterMode, searchDebounce]);

    // Load all scorecards once (unfiltered) for analytics
    useEffect(() => {
        if (isGuest) return;
        api.getScorecards({ limit: 50 }).then(res => {
            setAllScorecards(res.data);
        }).catch(() => {});
    }, [isGuest]);

    const loadScorecards = async (pageNum: number) => {
        const isFirstPage = pageNum === 1;
        if (isFirstPage) setLoading(true);
        else setLoadingMore(true);

        try {
            const filters: ScorecardFilters = { page: pageNum, limit: LIMIT };
            if (filterCategory) filters.category = filterCategory as DecisionCategory;
            if (filterVerdict) filters.verdict = filterVerdict;
            if (filterMode) filters.mode = filterMode as 'pre' | 'post';
            if (searchDebounce) filters.search = searchDebounce;

            const result = await api.getScorecards(filters);
            if (isFirstPage) {
                setScorecards(result.data);
            } else {
                setScorecards(prev => [...prev, ...result.data]);
            }
            setTotal(result.total);
            setHasMore(result.hasMore);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        loadScorecards(page + 1);
    };

    const clearFilters = () => {
        setFilterCategory('');
        setFilterVerdict('');
        setFilterMode('');
        setSearchQuery('');
    };

    const hasActiveFilters = filterCategory || filterVerdict || filterMode || searchDebounce;

    const avgScore = allScorecards.length > 0
        ? Math.round(allScorecards.reduce((sum, s) => sum + (s.totalScore || 0), 0) / allScorecards.length)
        : 0;
    const avgVerdict = getVerdictFromTotal(avgScore);
    const profile = buildDecisionProfile(allScorecards);
    const categoryAnalytics = buildCategoryAnalytics(allScorecards);
    const patternWarnings = detectPatterns(allScorecards);
    const hasCritical = patternWarnings.some(w => w.severity === 'critical');
    const pendingFollowUps = allScorecards.filter(s => s.isPreDecision && !s.outcome);

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

            {!isGuest && allScorecards.length > 0 && (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 2, mb: 4
                }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight={700} color="primary">
                                {allScorecards.length}
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

            {pendingFollowUps.length > 0 && (
                <Card sx={{ mb: 4, bgcolor: (t: any) => t.palette.mode === 'light' ? '#FFFBEB' : '#2A2215', border: (t: any) => `1px solid ${t.palette.mode === 'light' ? '#F59E0B30' : '#F59E0B40'}` }}>
                    <CardContent>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            🔔 Pre-Decision Follow-ups ({pendingFollowUps.length})
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            These pre-decision audits are waiting for outcome tracking or a post-decision review.
                        </Typography>
                        {pendingFollowUps.slice(0, 3).map(sc => {
                            const daysSince = Math.floor((Date.now() - new Date(sc.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <Box key={sc.id} sx={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    p: 1.5, mb: 1, bgcolor: 'background.paper', borderRadius: 1, border: (t: any) => `1px solid ${t.palette.mode === 'light' ? '#E4E4E7' : '#2A3544'}`
                                }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>{sc.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {daysSince === 0 ? 'Today' : `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`}
                                        </Typography>
                                    </Box>
                                    <Button size="small" onClick={() => navigate(`/scorecard/${sc.id}`)}>
                                        Follow up →
                                    </Button>
                                </Box>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {patternWarnings.length > 0 && (
                <Card sx={{
                    mb: 4,
                    bgcolor: (t: any) => {
                        const dark = t.palette.mode === 'dark';
                        if (hasCritical) return dark ? '#2A1515' : '#FEF2F2';
                        if (patternWarnings[0]?.severity === 'info') return dark ? '#0F2A1A' : '#F0FDF4';
                        return dark ? '#2A2215' : '#FFFBEB';
                    },
                    border: (t: any) => {
                        const a = t.palette.mode === 'dark' ? '40' : '30';
                        if (hasCritical) return `1px solid #EF4444${a}`;
                        if (patternWarnings[0]?.severity === 'info') return `1px solid #10B981${a}`;
                        return `1px solid #F59E0B${a}`;
                    }
                }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            🔍 Patterns Detected
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Based on your decision history, here's what the system has learned about your habits.
                        </Typography>
                        {patternWarnings.map((warning, i) => (
                            <Box key={i} sx={{
                                mb: 1.5, p: 1.5, borderRadius: 1,
                                bgcolor: (t: any) => {
                                    const dark = t.palette.mode === 'dark';
                                    if (warning.severity === 'critical') return dark ? '#3A1A1A' : '#FEE2E2';
                                    if (warning.severity === 'warning') return dark ? '#332A10' : '#FEF3C7';
                                    return dark ? '#0F2A1A' : '#ECFDF5';
                                },
                                border: (t: any) => {
                                    const a = t.palette.mode === 'dark' ? '40' : '30';
                                    if (warning.severity === 'critical') return `1px solid #EF4444${a}`;
                                    if (warning.severity === 'warning') return `1px solid #F59E0B${a}`;
                                    return `1px solid #10B981${a}`;
                                }
                            }}>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                    {warning.icon} {warning.title}
                                </Typography>
                                <Typography variant="body2">{warning.message}</Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            )}

            {profile && (
                <Card sx={{ mb: 4, bgcolor: (theme) => theme.palette.mode === 'light' ? '#E8F4FD' : '#0D2137', border: (theme) => `1px solid ${theme.palette.mode === 'light' ? '#0077B620' : '#0077B640'}` }}>
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
                                                bgcolor: (t: any) => t.palette.mode === 'light' ? '#E4E4E7' : '#2A3544',
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

            {!loading && !isGuest && scorecards.length === 0 && !error && !hasActiveFilters && (
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            {hasActiveFilters ? `Filtered Results (${total})` : 'Recent Scorecards'}
                        </Typography>
                        {hasActiveFilters && (
                            <Button size="small" onClick={clearFilters}>Clear Filters</Button>
                        )}
                    </Box>

                    {/* Filter Bar */}
                    <Card sx={{ mb: 3, p: 2 }}>
                        <TextField
                            fullWidth size="small" placeholder="Search decisions..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">🔍</InputAdornment>
                            }}
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Category</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {categories.map(cat => (
                                    <Chip
                                        key={cat.value} size="small"
                                        label={`${cat.icon} ${cat.label}`}
                                        onClick={() => setFilterCategory(filterCategory === cat.value ? '' : cat.value)}
                                        color={filterCategory === cat.value ? 'primary' : 'default'}
                                        variant={filterCategory === cat.value ? 'filled' : 'outlined'}
                                    />
                                ))}
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Score Band</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {verdictOptions.map(v => (
                                    <Chip
                                        key={v.value} size="small"
                                        label={v.label}
                                        onClick={() => setFilterVerdict(filterVerdict === v.value ? '' : v.value)}
                                        color={filterVerdict === v.value ? 'primary' : 'default'}
                                        variant={filterVerdict === v.value ? 'filled' : 'outlined'}
                                    />
                                ))}
                            </Box>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Decision Mode</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                <Chip
                                    size="small" label="🔮 Pre-decision"
                                    onClick={() => setFilterMode(filterMode === 'pre' ? '' : 'pre')}
                                    color={filterMode === 'pre' ? 'primary' : 'default'}
                                    variant={filterMode === 'pre' ? 'filled' : 'outlined'}
                                />
                                <Chip
                                    size="small" label="🔍 Post-decision"
                                    onClick={() => setFilterMode(filterMode === 'post' ? '' : 'post')}
                                    color={filterMode === 'post' ? 'primary' : 'default'}
                                    variant={filterMode === 'post' ? 'filled' : 'outlined'}
                                />
                            </Box>
                        </Box>
                    </Card>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {scorecards.map(sc => (
                            <ScorecardCard
                                key={sc.id}
                                scorecard={sc}
                                onClick={() => navigate(`/scorecard/${sc.id}`)}
                            />
                        ))}
                    </Box>

                    {hasMore && (
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Button
                                variant="outlined" onClick={handleLoadMore} disabled={loadingMore}
                                fullWidth
                            >
                                {loadingMore ? 'Loading...' : `Load More (${scorecards.length} of ${total})`}
                            </Button>
                        </Box>
                    )}
                </Box>
            )}

            {!loading && !isGuest && scorecards.length === 0 && hasActiveFilters && (
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>🔍 No matching scorecards</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Try adjusting your filters.
                        </Typography>
                        <Button variant="outlined" onClick={clearFilters}>Clear Filters</Button>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};
