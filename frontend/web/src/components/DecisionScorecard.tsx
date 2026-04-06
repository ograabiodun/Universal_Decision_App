import React, { useState } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Card,
    CardContent,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    TextField,
    Alert,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

const PillarCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    transition: 'transform 0.2s',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4]
    }
}));

const pillars = [
    {
        id: 'planning',
        name: 'Planning',
        question: 'Did I have a budget, fund, or plan for this?',
        good: 'Yes — resources allocated or contingency exists',
        bad: 'Partial — some planning, but gaps remain',
        ugly: 'No — acted without preparation or safety net'
    },
    {
        id: 'research',
        name: 'Research',
        question: 'Did I explore alternatives and gather information?',
        good: 'Yes — compared options, sought advice, used data',
        bad: 'Partial — some research, but incomplete',
        ugly: 'No — acted impulsively, ignored alternatives'
    },
    {
        id: 'timing',
        name: 'Timing',
        question: 'Did I act at the right time, or delay/rush?',
        good: 'Yes — timely action, prevented escalation',
        bad: 'Partial — slight delay/rush, but manageable',
        ugly: 'No — poor timing caused unnecessary cost or harm'
    },
    {
        id: 'emotional',
        name: 'Emotional Control',
        question: 'Was I calm and rational, or pressured/emotional?',
        good: 'Yes — clear-headed, deliberate choice',
        bad: 'Partial — some pressure, but still reasonable',
        ugly: 'No — panicked, coerced, or emotionally driven'
    }
];

const categories = [
    { value: 'career', label: '💼 Career', color: '#2196f3' },
    { value: 'relationships', label: '❤️ Relationships', color: '#e91e63' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family', color: '#4caf50' },
    { value: 'investments', label: '📈 Investments', color: '#ff9800' },
    { value: 'savings', label: '💰 Savings', color: '#9c27b0' },
    { value: 'purchases', label: '🛍️ Purchases', color: '#f44336' },
    { value: 'health', label: '🏥 Health', color: '#00bcd4' },
    { value: 'education', label: '🎓 Education', color: '#3f51b5' },
    { value: 'business', label: '🏢 Business', color: '#795548' }
];

export const DecisionScorecard: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [scores, setScores] = useState<Record<string, { score: number; notes: string }>>(
        pillars.reduce((acc, p) => ({ ...acc, [p.id]: { score: 0, notes: '' } }), {})
    );
    const [isPreDecision, setIsPreDecision] = useState(true);

    const handleScoreChange = (pillarId: string, value: string) => {
        setScores(prev => ({
            ...prev,
            [pillarId]: { ...prev[pillarId], score: parseInt(value) }
        }));
    };

    const handleNotesChange = (pillarId: string, notes: string) => {
        setScores(prev => ({
            ...prev,
            [pillarId]: { ...prev[pillarId], notes }
        }));
    };

    const calculateTotalScore = () => {
        return Object.values(scores).reduce((sum, s) => sum + s.score, 0);
    };

    const getVerdictInfo = (score: number) => {
        if (score >= 3) return { label: 'Excellent', color: '#4caf50', icon: '✅' };
        if (score >= 1) return { label: 'Acceptable', color: '#ff9800', icon: '⚠️' };
        if (score === 0) return { label: 'Borderline', color: '#f44336', icon: '❗' };
        if (score >= -2) return { label: 'Poor', color: '#d32f2f', icon: '🚩' };
        return { label: 'Critical', color: '#b71c1c', icon: '💥' };
    };

    const handleSubmit = async () => {
        const scorecardData = {
            category,
            title,
            scores: Object.entries(scores).map(([pillarId, data]) => ({
                pillarName: pillars.find(p => p.id === pillarId)?.name,
                score: data.score,
                notes: data.notes
            })),
            isPreDecision
        };

        try {
            const response = await fetch('/api/create-scorecard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scorecardData)
            });

            if (response.ok) {
                // Show success and redirect to results
                setActiveStep(3);
            }
        } catch (error) {
            console.error('Error saving scorecard:', error);
        }
    };

    const totalScore = calculateTotalScore();
    const verdict = getVerdictInfo(totalScore);

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                🎯 Universal Decision Audit Scorecard
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                <Step><StepLabel>Category</StepLabel></Step>
                <Step><StepLabel>Score Each Pillar</StepLabel></Step>
                <Step><StepLabel>Review</StepLabel></Step>
                <Step><StepLabel>Results</StepLabel></Step>
            </Stepper>

            {/* Step 1: Category Selection */}
            {activeStep === 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        What type of decision are you auditing?
                    </Typography>

                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                        <RadioGroup
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                                {categories.map(cat => (
                                    <FormControlLabel
                                        key={cat.value}
                                        value={cat.value}
                                        control={<Radio />}
                                        label={
                                            <Chip
                                                label={cat.label}
                                                sx={{ bgcolor: cat.color, color: 'white', width: '100%' }}
                                            />
                                        }
                                    />
                                ))}
                            </Box>
                        </RadioGroup>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Decision Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Buying a house, Career change to tech, Starting a business"
                        sx={{ mb: 3 }}
                    />

                    <FormControl component="fieldset">
                        <FormLabel component="legend">Decision Type</FormLabel>
                        <RadioGroup
                            row
                            value={isPreDecision ? 'pre' : 'post'}
                            onChange={(e) => setIsPreDecision(e.target.value === 'pre')}
                        >
                            <FormControlLabel value="pre" control={<Radio />} label="Pre-decision (planning)" />
                            <FormControlLabel value="post" control={<Radio />} label="Post-decision (review)" />
                        </RadioGroup>
                    </FormControl>

                    <Button
                        variant="contained"
                        onClick={() => setActiveStep(1)}
                        disabled={!category || !title}
                        sx={{ mt: 2 }}
                    >
                        Next: Score Your Decision
                    </Button>
                </Box>
            )}

            {/* Step 2: Score Each Pillar */}
            {activeStep === 1 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Score each pillar honestly
                    </Typography>

                    {pillars.map(pillar => (
                        <PillarCard key={pillar.id}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {pillar.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {pillar.question}
                                </Typography>

                                <FormControl component="fieldset" sx={{ mt: 2 }}>
                                    <RadioGroup
                                        value={scores[pillar.id].score.toString()}
                                        onChange={(e) => handleScoreChange(pillar.id, e.target.value)}
                                    >
                                        <FormControlLabel
                                            value="1"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="body2" color="success.main">✅ Good</Typography>
                                                    <Typography variant="caption">{pillar.good}</Typography>
                                                </Box>
                                            }
                                        />
                                        <FormControlLabel
                                            value="0"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="body2" color="warning.main">⚠️ Bad</Typography>
                                                    <Typography variant="caption">{pillar.bad}</Typography>
                                                </Box>
                                            }
                                        />
                                        <FormControlLabel
                                            value="-1"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="body2" color="error.main">❌ Ugly</Typography>
                                                    <Typography variant="caption">{pillar.ugly}</Typography>
                                                </Box>
                                            }
                                        />
                                    </RadioGroup>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Notes (optional)"
                                    value={scores[pillar.id].notes}
                                    onChange={(e) => handleNotesChange(pillar.id, e.target.value)}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </PillarCard>
                    ))}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={() => setActiveStep(0)}>
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setActiveStep(2)}
                            disabled={Object.values(scores).some(s => s.score === undefined)}
                        >
                            Next: Review
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Step 3: Review */}
            {activeStep === 2 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Review Your Scorecard
                    </Typography>

                    <Alert severity={totalScore >= 1 ? 'success' : totalScore >= -1 ? 'warning' : 'error'} sx={{ mb: 3 }}>
                        <Typography variant="h6">
                            Total Score: {totalScore} {verdict.icon}
                        </Typography>
                        <Typography>
                            Verdict: <strong style={{ color: verdict.color }}>{verdict.label}</strong>
                        </Typography>
                    </Alert>

                    {pillars.map(pillar => (
                        <Box key={pillar.id} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="subtitle1">{pillar.name}</Typography>
                            <Typography variant="body2">
                                Score: {scores[pillar.id].score === 1 ? '✅ Good' :
                                    scores[pillar.id].score === 0 ? '⚠️ Bad' : '❌ Ugly'}
                            </Typography>
                            {scores[pillar.id].notes && (
                                <Typography variant="caption" color="text.secondary">
                                    Note: {scores[pillar.id].notes}
                                </Typography>
                            )}
                        </Box>
                    ))}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={() => setActiveStep(1)}>
                            Back
                        </Button>
                        <Button variant="contained" onClick={handleSubmit}>
                            Save Scorecard
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Step 4: Results */}
            {activeStep === 3 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Results & Insights
                    </Typography>

                    <Alert severity="success" sx={{ mb: 3 }}>
                        Scorecard saved successfully!
                    </Alert>

                    <Typography variant="body1" paragraph>
                        Your decision has been analyzed. Based on your scores, here are personalized insights:
                    </Typography>

                    {/* AI-generated insights would appear here */}
                    <Card sx={{ bgcolor: '#f0f7ff', p: 2, mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            💡 AI-Generated Insights
                        </Typography>
                        <Typography variant="body2">
                            • Your planning score suggests you're good at preparation. Consider building this strength in other areas.
                            • Research could be improved by seeking diverse perspectives before making similar decisions.
                            • Your emotional control was strong - this served you well in maintaining objectivity.
                        </Typography>
                    </Card>

                    <Button variant="contained" onClick={() => {
                        setActiveStep(0);
                        setCategory('');
                        setTitle('');
                        setScores(pillars.reduce((acc, p) => ({ ...acc, [p.id]: { score: 0, notes: '' } }), {}));
                    }}>
                        New Scorecard
                    </Button>
                </Box>
            )}
        </Box>
    );
};