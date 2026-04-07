import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { getScorePercent, getVerdictFromScore } from '../constants';

interface ScoreDisplayProps {
    weightedScore: number;
    size?: 'small' | 'large';
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ weightedScore, size = 'large' }) => {
    const pct = getScorePercent(weightedScore);
    const verdict = getVerdictFromScore(weightedScore);

    if (size === 'small') {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: verdict.color, minWidth: 36 }}>
                    {pct}%
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                        flexGrow: 1, height: 6, borderRadius: 3,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': { bgcolor: verdict.color, borderRadius: 3 }
                    }}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
                sx={{
                    width: 120, height: 120, borderRadius: '50%',
                    border: `6px solid ${verdict.color}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2
                }}
            >
                <Typography variant="h4" fontWeight={700} sx={{ color: verdict.color }}>
                    {pct}%
                </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: verdict.color }}>
                {verdict.icon} {verdict.label}
            </Typography>
        </Box>
    );
};
