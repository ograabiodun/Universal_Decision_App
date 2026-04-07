import React from 'react';
import { Box, Typography } from '@mui/material';
import { getVerdictFromTotal } from '../constants';

interface ScoreDisplayProps {
    totalScore: number;
    size?: 'small' | 'large';
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ totalScore, size = 'large' }) => {
    const verdict = getVerdictFromTotal(totalScore);
    const displayScore = totalScore > 0 ? `+${totalScore}` : `${totalScore}`;

    if (size === 'small') {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                        color: verdict.color,
                        fontFamily: '"JetBrains Mono", monospace',
                        minWidth: 36
                    }}
                >
                    {displayScore}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: verdict.color }}>
                    {verdict.icon} {verdict.label}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ textAlign: 'center', py: 2, animation: 'fadeInUp 0.5s ease' }}>
            <Box
                sx={{
                    width: 120, height: 120, borderRadius: '50%',
                    border: `6px solid ${verdict.color}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: verdict.color, fontFamily: '"JetBrains Mono", monospace' }}
                >
                    {displayScore}
                </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: verdict.color }}>
                {verdict.icon} {verdict.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 420, mx: 'auto', lineHeight: 1.6 }}>
                {verdict.description}
            </Typography>
            <Box sx={{
                mt: 1.5, p: 1.5, bgcolor: `${verdict.color}12`, borderRadius: 1,
                border: `1px solid ${verdict.color}30`, maxWidth: 420, mx: 'auto'
            }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: verdict.color }}>
                    💡 {verdict.recommendation}
                </Typography>
            </Box>
        </Box>
    );
};
