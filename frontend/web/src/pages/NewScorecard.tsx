import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Stepper, Step, StepLabel, Button, Typography, Card, CardContent,
    TextField, Alert, Chip, ToggleButton, ToggleButtonGroup, Paper, Slider
} from '@mui/material';
import { pillars, categories, emotions, getVerdictFromTotal, getLevelLabel, generateRuleBasedInsights, getPillarFeedback } from '../constants';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { ScoreLevel, ScoreValue, EmotionEntry, DecisionCategory, Scorecard, PatternWarning } from '../types';
import { api } from '../api/client';
import { detectPatterns } from '../lib/analytics';

interface PillarState {
    score: ScoreValue | null;
    level: ScoreLevel | null;
    notes: string;
}

export const NewScorecard: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [isPreDecision, setIsPreDecision] = useState(true);
    const [scores, setScores] = useState<Record<string, PillarState>>(
        pillars.reduce((acc, p) => ({ ...acc, [p.id]: { score: null, level: null, notes: '' } }), {})
    );
    const [emotionBefore, setEmotionBefore] = useState<EmotionEntry>({ emotions: [], intensity: 5 });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<Scorecard[]>([]);
    const [categoryWarnings, setCategoryWarnings] = useState<PatternWarning[]>([]);

    useEffect(() => {
        api.getScorecards({ limit: 50 }).then(res => setHistory(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (category && history.length >= 3) {
            setCategoryWarnings(detectPatterns(history, category as DecisionCategory));
        } else {
            setCategoryWarnings([]);
        }
    }, [category, history]);

    const handleScoreChange = (pillarId: string, value: ScoreValue, level: ScoreLevel) => {
        setScores(prev => ({
            ...prev,
            [pillarId]: { ...prev[pillarId], score: value, level }
        }));
    };

    const handleNotesChange = (pillarId: string, notes: string) => {
        setScores(prev => ({
            ...prev,
            [pillarId]: { ...prev[pillarId], notes }
        }));
    };

    const toggleEmotion = (emotionId: string) => {
        setEmotionBefore(prev => ({
            ...prev,
            emotions: prev.emotions.includes(emotionId)
                ? prev.emotions.filter(e => e !== emotionId)
                : [...prev.emotions, emotionId]
        }));
    };

    const allScored = Object.values(scores).every(s => s.score !== null);

    const totalScore = allScored
        ? Object.values(scores).reduce((sum, s) => sum + (s.score as number), 0)
        : 0;

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        try {
            const scorecardData = {
                category,
                title,
                isPreDecision,
                emotionBefore: emotionBefore.emotions.length > 0 ? emotionBefore : undefined,
                scores: Object.entries(scores).map(([pillarId, data]) => ({
                    pillarId,
                    pillarName: pillars.find(p => p.id === pillarId)?.name || pillarId,
                    score: data.score,
                    level: data.level,
                    notes: data.notes
                }))
            };
            const result = await api.createScorecard(scorecardData);
            navigate(`/scorecard/${result.id}`, { state: { scorecard: result } });
        } catch (err: any) {
            setError(err.message || 'Failed to save scorecard');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
                New Decision Audit
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
                <Step><StepLabel>Context</StepLabel></Step>
                <Step><StepLabel>Score Pillars</StepLabel></Step>
                <Step><StepLabel>Emotional Check-in</StepLabel></Step>
                <Step><StepLabel>Review & Save</StepLabel></Step>
            </Stepper>

            {activeStep === 0 && (
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            What decision are you auditing?
                        </Typography>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                            gap: 1.5, mb: 3
                        }}>
                            {categories.map(cat => (
                                <Paper
                                    key={cat.value}
                                    elevation={category === cat.value ? 4 : 0}
                                    onClick={() => setCategory(cat.value)}
                                    sx={{
                                        p: 2, textAlign: 'center', cursor: 'pointer',
                                        border: category === cat.value
                                            ? `2px solid ${cat.color}`
                                            : '2px solid transparent',
                                        bgcolor: category === cat.value ? `${cat.color}15` : 'background.paper',
                                        transition: 'all 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
                                    }}
                                >
                                    <Typography variant="h5" sx={{ mb: 0.5 }}>{cat.icon}</Typography>
                                    <Typography variant="body2" fontWeight={600}>{cat.label}</Typography>
                                </Paper>
                            ))}
                        </Box>

                        <TextField
                            fullWidth
                            label="Decision Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Buying a house, Career change, Starting a business"
                            sx={{ mb: 3 }}
                        />

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Decision Type
                            </Typography>
                            <ToggleButtonGroup
                                value={isPreDecision ? 'pre' : 'post'}
                                exclusive
                                onChange={(_, v) => v && setIsPreDecision(v === 'pre')}
                                fullWidth
                            >
                                <ToggleButton value="pre">🔮 Pre-decision (planning)</ToggleButton>
                                <ToggleButton value="post">🔍 Post-decision (review)</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {categoryWarnings.length > 0 && (
                            <Alert
                                severity={categoryWarnings.some(w => w.severity === 'critical') ? 'error' : 'warning'}
                                sx={{ mb: 3 }}
                            >
                                <Typography variant="body2" fontWeight={600} gutterBottom>
                                    📋 Pattern Alert{categoryWarnings.length > 1 ? 's' : ''}
                                </Typography>
                                {categoryWarnings.slice(0, 3).map((w, i) => (
                                    <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                                        {w.icon} {w.message}
                                    </Typography>
                                ))}
                            </Alert>
                        )}

                        <Button
                            variant="contained"
                            onClick={() => setActiveStep(1)}
                            disabled={!category || !title.trim()}
                            fullWidth
                            size="large"
                        >
                            Next: Score Your Decision
                        </Button>
                    </CardContent>
                </Card>
            )}

            {activeStep === 1 && (
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        For each pillar, choose the option that best describes your situation.
                    </Typography>

                    {pillars.map(pillar => {
                        const currentState = scores[pillar.id];
                        const question = isPreDecision ? pillar.preQuestion : pillar.postQuestion;

                        return (
                            <Card key={pillar.id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {pillar.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {question}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                                        {pillar.options.map(option => {
                                            const isSelected = currentState.level === option.level;
                                            const levelInfo = getLevelLabel(option.level);
                                            return (
                                                <Paper
                                                    key={option.level}
                                                    onClick={() => handleScoreChange(pillar.id, option.value, option.level)}
                                                    elevation={isSelected ? 3 : 0}
                                                    sx={{
                                                        p: 2, cursor: 'pointer',
                                                        border: isSelected
                                                            ? `2px solid ${levelInfo.color}`
                                                            : '2px solid #E4E4E7',
                                                        bgcolor: isSelected ? `${levelInfo.color}10` : 'background.paper',
                                                        transition: 'all 0.2s',
                                                        '&:hover': { borderColor: levelInfo.color, bgcolor: `${levelInfo.color}08` }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body1">{option.icon}</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {option.label}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                                                        {isPreDecision ? option.preDescription : option.postDescription}
                                                    </Typography>
                                                </Paper>
                                            );
                                        })}
                                    </Box>

                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        size="small"
                                        label="Notes (optional)"
                                        value={scores[pillar.id].notes}
                                        onChange={e => handleNotesChange(pillar.id, e.target.value)}
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>
                        );
                    })}

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button onClick={() => setActiveStep(0)}>Back</Button>
                        <Button
                            variant="contained"
                            onClick={() => setActiveStep(2)}
                            disabled={!allScored}
                            fullWidth
                        >
                            {allScored
                                ? 'Next: Emotional Check-in'
                                : `Score all pillars (${Object.values(scores).filter(s => s.score !== null).length}/4)`}
                        </Button>
                    </Box>
                </Box>
            )}

            {activeStep === 2 && (
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            How are you feeling right now?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Select any emotions that apply. This helps track your emotional patterns over time.
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                            {emotions.map(emotion => {
                                const isSelected = emotionBefore.emotions.includes(emotion.id);
                                return (
                                    <Chip
                                        key={emotion.id}
                                        label={`${emotion.icon} ${emotion.label}`}
                                        onClick={() => toggleEmotion(emotion.id)}
                                        color={isSelected ? 'primary' : 'default'}
                                        variant={isSelected ? 'filled' : 'outlined'}
                                        sx={{ fontSize: '0.9rem', py: 2.5 }}
                                    />
                                );
                            })}
                        </Box>

                        {emotionBefore.emotions.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" fontWeight={600} gutterBottom>
                                    Emotional Intensity
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    How strong are these feelings? (1 = mild, 10 = overwhelming)
                                </Typography>
                                <Slider
                                    value={emotionBefore.intensity}
                                    onChange={(_, v) => setEmotionBefore(prev => ({ ...prev, intensity: v as number }))}
                                    min={1}
                                    max={10}
                                    marks
                                    valueLabelDisplay="auto"
                                    sx={{ mt: 2 }}
                                />
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button onClick={() => setActiveStep(1)}>Back</Button>
                            <Button
                                variant="contained"
                                onClick={() => setActiveStep(3)}
                                fullWidth
                            >
                                Next: Review
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {activeStep === 3 && (
                <Box>
                    <ScoreDisplay totalScore={totalScore} />

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
                                <Chip
                                    label={`${categories.find(c => c.value === category)?.icon} ${categories.find(c => c.value === category)?.label}`}
                                    size="small"
                                />
                            </Box>

                            {pillars.map(pillar => {
                                const s = scores[pillar.id];
                                const levelInfo = s.level ? getLevelLabel(s.level) : null;

                                return (
                                    <Box key={pillar.id} sx={{ mb: 2, p: 1.5, bgcolor: '#f5f7fa', borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {pillar.name}
                                            </Typography>
                                            {levelInfo && (
                                                <Chip
                                                    label={`${levelInfo.icon} ${levelInfo.label}`}
                                                    size="small"
                                                    sx={{ bgcolor: `${levelInfo.color}20`, color: levelInfo.color, fontWeight: 600 }}
                                                />
                                            )}
                                        </Box>
                                        {s.notes && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                {s.notes}
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}

                            {emotionBefore.emotions.length > 0 && (
                                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f0f0ff', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight={600} gutterBottom>
                                        Emotional State
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {emotionBefore.emotions.map(eid => {
                                            const em = emotions.find(e => e.id === eid);
                                            return em ? (
                                                <Chip key={eid} label={`${em.icon} ${em.label}`} size="small" variant="outlined" />
                                            ) : null;
                                        })}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        Intensity: {emotionBefore.intensity}/10
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3, bgcolor: '#f0f7ff' }}>
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                💡 Quick Insights
                            </Typography>
                            {generateRuleBasedInsights(
                                Object.entries(scores).map(([pillarId, data]) => ({
                                    pillarId,
                                    pillarName: pillars.find(p => p.id === pillarId)?.name || pillarId,
                                    score: data.score as ScoreValue,
                                    level: data.level as ScoreLevel,
                                    notes: data.notes
                                })),
                                category as DecisionCategory,
                                emotionBefore.emotions.length > 0 ? emotionBefore : undefined,
                                isPreDecision
                            ).map((insight, i) => (
                                <Box key={i} sx={{ mb: 1, p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #E4E4E7' }}>
                                    <Typography variant="body2">{insight}</Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={() => setActiveStep(2)} disabled={saving}>Back</Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={saving}
                            fullWidth
                            size="large"
                        >
                            {saving ? 'Saving...' : 'Save Scorecard'}
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
