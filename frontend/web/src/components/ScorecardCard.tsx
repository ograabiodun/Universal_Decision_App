import React from 'react';
import { Card, CardContent, CardActionArea, Typography, Box, Chip } from '@mui/material';
import { Scorecard } from '../types';
import { categories } from '../constants';
import { ScoreDisplay } from './ScoreDisplay';

interface ScorecardCardProps {
    scorecard: Scorecard;
    onClick: () => void;
}

export const ScorecardCard: React.FC<ScorecardCardProps> = ({ scorecard, onClick }) => {
    const cat = categories.find(c => c.value === scorecard.category);

    return (
        <Card>
            <CardActionArea onClick={onClick} sx={{ p: 0 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {scorecard.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip
                                    label={`${cat?.icon || ''} ${cat?.label || scorecard.category}`}
                                    size="small"
                                    sx={{ bgcolor: cat?.color, color: 'white', fontSize: '0.75rem' }}
                                />
                                <Chip
                                    label={scorecard.isPreDecision ? 'Pre-decision' : 'Post-decision'}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                />
                            </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(scorecard.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <ScoreDisplay totalScore={scorecard.totalScore} size="small" />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
