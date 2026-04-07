import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Stepper, Step, StepLabel, Button, Typography, Card, CardContent,
    TextField, Alert, Chip, ToggleButton, ToggleButtonGroup, Paper
} from '@mui/material';
import { pillars, categories, calculateWeightedScore, getVerdictFromScore, getScorePercent } from '../constants';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { api } from '../api/client';

export const NewScorecard: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [isPreDecision, setIsPreDecision] = useState(true);
    const [scores, setScores] = useState<Record<string, { score: number | null; notes: string }>>(
        pillars.reduce((acc, p) => ({ ...acc, [p.id]: { score: null, notes: '' } }), {})
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScoreChange = (pillarId: string, value: number) => {
        setScores(prev => ({
            ...prev,
            [pillarId]: { ...prev[pillarId], score: value }
        }));
    };

    const handleNotesChange = (pillarId: string, notes: string) => {
        setScores(prev => ({
            ...prev,
            [pillarId]: { ...prev[pillarId], notes }
        }));
    };

    const allScored = Object.values(scores).every(s => s.score !== null);

    const scoredPillars = Object.entries(scores)
        .filter(([_, s]) => s.score !== null)
        .map(([pillarId, s]) => ({ pillarId, score: s.score as number }));

    const weightedAvg = allScored ? calculateWeightedScore(scoredPillars, category) : 0;
    const verdict = getVerdictFromScore(weightedAvg);

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        try {
            const scorecardData = {
                category,
                title,
                isPreDecision,
                scores: Object.entries(scores).map(([pillarId, data]) => ({
                    pillarId,
                    pillarName: pillars.find(p => p.id === pillarId)?.name || pillarId,
                    score: data.score,
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
                New Decision Scorecard
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                <Step><StepLabel>Category</StepLabel></Step>
                <Step><StepLabel>Score Pillars</StepLabel></Step>
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
                                        bgcolor: category === cat.value ? `${cat.color}10` : 'background.paper',
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
                        Rate each pillar from 1 (worst) to 5 (best). All pillars must be scored.
                    </Typography>

                    {pillars.map(pillar => {
                        const currentScore = scores[pillar.id].score;
                        return (
                            <Card key={pillar.id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {pillar.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {pillar.question}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                        {[1, 2, 3, 4, 5].map(val => (
                                            <Chip
                                                key={val}
                                                label={val}
                                                onClick={() => handleScoreChange(pillar.id, val)}
                                                color={currentScore === val ? 'primary' : 'default'}
                                                variant={currentScore === val ? 'filled' : 'outlined'}
                                                sx={{
                                                    minWidth: 44, fontWeight: 700, fontSize: '1rem',
                                                    ...(currentScore === val && {
                                                        bgcolor: val <= 2 ? '#d32f2f' : val === 3 ? '#f57c00' : '#2e7d32',
                                                        color: 'white'
                                                    })
                                                }}
                                            />
                                        ))}
                                    </Box>

                                    {currentScore !== null && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                            {pillar.descriptions[currentScore]}
                                        </Typography>
                                    )}

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
                            {allScored ? 'Next: Review' : `Score all pillars (${scoredPillars.length}/4)`}
                        </Button>
                    </Box>
                </Box>
            )}

            {activeStep === 2 && (
                <Box>
                    <ScoreDisplay weightedScore={weightedAvg} />

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
                                const cat = categories.find(c => c.value === category);
                                const weight = cat?.weights[pillar.id] || 1;

                                return (
                                    <Box key={pillar.id} sx={{ mb: 2, p: 1.5, bgcolor: '#f5f7fa', borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {pillar.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {weight !== 1 && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        ×{weight.toFixed(1)}
                                                    </Typography>
                                                )}
                                                <Chip
                                                    label={`${s.score}/5`}
                                                    size="small"
                                                    color={(s.score || 0) >= 4 ? 'success' : (s.score || 0) >= 3 ? 'warning' : 'error'}
                                                />
                                            </Box>
                                        </Box>
                                        {s.notes && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                {s.notes}
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={() => setActiveStep(1)} disabled={saving}>Back</Button>
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
