import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Button, Alert, CircularProgress,
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import { Scorecard, DecisionCategory } from '../types';
import { api } from '../api/client';
import { categories, emotions, getLevelLabel, getPillarFeedback, generateRuleBasedInsights } from '../constants';
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
            const result = await api.getAiInsights(scorecard.id, scorecard);
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

            <ScoreDisplay totalScore={scorecard.totalScore} />

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

                    <Typography variant="subtitle2" gutterBottom>Pillar Breakdown</Typography>
                    {scorecard.scores.map(s => {
                        const levelInfo = s.level ? getLevelLabel(s.level) : null;
                        const feedback = s.level ? getPillarFeedback(s.pillarId, s.pillarName, s.level) : null;

                        return (
                            <Box key={s.pillarId} sx={{ mb: 2, p: 2, bgcolor: '#f5f7fa', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {s.pillarName}
                                    </Typography>
                                    {levelInfo && (
                                        <Chip
                                            label={`${levelInfo.icon} ${levelInfo.label}`}
                                            size="small"
                                            sx={{ bgcolor: `${levelInfo.color}20`, color: levelInfo.color, fontWeight: 600 }}
                                        />
                                    )}
                                </Box>
                                {feedback && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            {feedback.feedback}
                                        </Typography>
                                        {s.level !== 'good' && (
                                            <Typography variant="body2" sx={{ color: '#6366F1', fontWeight: 500 }}>
                                                → {feedback.actionItem}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                                {s.notes && (
                                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                        &ldquo;{s.notes}&rdquo;
                                    </Typography>
                                )}
                            </Box>
                        );
                    })}

                    {scorecard.emotionBefore && scorecard.emotionBefore.emotions.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>Emotional State</Typography>
                            <Box sx={{ p: 2, bgcolor: '#f0f0ff', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                                    {scorecard.emotionBefore.emotions.map(eid => {
                                        const em = emotions.find(e => e.id === eid);
                                        return em ? (
                                            <Chip key={eid} label={`${em.icon} ${em.label}`} size="small" variant="outlined" />
                                        ) : null;
                                    })}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Intensity: {scorecard.emotionBefore.intensity}/10
                                </Typography>
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card sx={{ mb: 3, bgcolor: '#f0f7ff' }}>
                <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>💡 Decision Insights</Typography>
                    {(() => {
                        const ruleInsights = scorecard.ruleInsights || generateRuleBasedInsights(
                            scorecard.scores,
                            scorecard.category as DecisionCategory,
                            scorecard.emotionBefore,
                            scorecard.isPreDecision
                        );
                        return ruleInsights.map((insight, i) => (
                            <Box key={i} sx={{ mb: 1.5, p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #E4E4E7' }}>
                                <Typography variant="body2">{insight}</Typography>
                            </Box>
                        ));
                    })()}
                </CardContent>
            </Card>

            <Card sx={{ mb: 3, bgcolor: scorecard.aiInsights ? '#f5f0ff' : undefined }}>
                <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>🤖 AI-Powered Insights</Typography>
                    {scorecard.aiInsights ? (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                            {scorecard.aiInsights}
                        </Typography>
                    ) : (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Get deeper, personalized analysis powered by AI.
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={handleGetInsights}
                                disabled={aiLoading}
                            >
                                {aiLoading ? 'Generating...' : 'Generate AI Analysis'}
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
