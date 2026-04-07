import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Button, Alert, CircularProgress,
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import { Scorecard } from '../types';
import { api } from '../api/client';
import { categories, pillars, getVerdictFromScore } from '../constants';
import { ScoreDisplay } from '../components/ScoreDisplay';

export const ScorecardDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const stateScorecard = (location.state as any)?.scorecard as Scorecard | undefined;

    const [scorecard, setScorecard] = useState<Scorecard | null>(stateScorecard || null);
    const [loading, setLoading] = useState(!stateScorecard);
    const [error, setError] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        if (!stateScorecard && id) {
            loadScorecard();
        }
    }, [id]);

    const loadScorecard = async () => {
        try {
            const data = await api.getScorecard(id!);
            setScorecard(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.deleteScorecard(id!);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
            setDeleting(false);
            setDeleteOpen(false);
        }
    };

    const handleGetInsights = async () => {
        if (!scorecard) return;
        setAiLoading(true);
        try {
            const result = await api.getAiInsights(scorecard.id, scorecard.scores);
            setScorecard({ ...scorecard, aiInsights: result.insights });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) {
        return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>;
    }

    if (error && !scorecard) {
        return (
            <Box>
                <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>← Back to Dashboard</Button>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!scorecard) {
        return (
            <Box>
                <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>← Back to Dashboard</Button>
                <Alert severity="warning">Scorecard not found</Alert>
            </Box>
        );
    }

    const cat = categories.find(c => c.value === scorecard.category);

    return (
        <Box>
            <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>← Back to Dashboard</Button>

            <ScoreDisplay weightedScore={scorecard.weightedScore} />

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                            <Typography variant="h5" fontWeight={700}>{scorecard.title}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip
                                    label={`${cat?.icon} ${cat?.label}`}
                                    sx={{ bgcolor: cat?.color, color: 'white' }}
                                />
                                <Chip
                                    label={scorecard.isPreDecision ? '🔮 Pre-decision' : '🔍 Post-decision'}
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {new Date(scorecard.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>Pillar Scores</Typography>
                    {scorecard.scores.map(s => {
                        const pillar = pillars.find(p => p.id === s.pillarId);
                        const weight = cat?.weights[s.pillarId] || 1;

                        return (
                            <Box key={s.pillarId} sx={{ mb: 2, p: 2, bgcolor: '#f5f7fa', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {s.pillarName}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        {weight !== 1 && (
                                            <Typography variant="caption" color="text.secondary">
                                                ×{weight.toFixed(1)}
                                            </Typography>
                                        )}
                                        <Chip
                                            label={`${s.score}/5`}
                                            size="small"
                                            color={s.score >= 4 ? 'success' : s.score >= 3 ? 'warning' : 'error'}
                                        />
                                    </Box>
                                </Box>
                                {pillar && (
                                    <Typography variant="caption" color="text.secondary">
                                        {pillar.descriptions[s.score]}
                                    </Typography>
                                )}
                                {s.notes && (
                                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                        &ldquo;{s.notes}&rdquo;
                                    </Typography>
                                )}
                            </Box>
                        );
                    })}
                </CardContent>
            </Card>

            <Card sx={{ mb: 3, bgcolor: scorecard.aiInsights ? '#f0f7ff' : undefined }}>
                <CardContent>
                    <Typography variant="subtitle2" gutterBottom>💡 AI Insights</Typography>
                    {scorecard.aiInsights ? (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                            {scorecard.aiInsights}
                        </Typography>
                    ) : (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Get personalized insights powered by AI to improve future decisions.
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={handleGetInsights}
                                disabled={aiLoading}
                            >
                                {aiLoading ? 'Generating...' : 'Generate AI Insights'}
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button color="error" variant="outlined" onClick={() => setDeleteOpen(true)}>
                Delete Scorecard
            </Button>

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Delete Scorecard?</DialogTitle>
                <DialogContent>
                    <Typography>This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button color="error" onClick={handleDelete} disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
