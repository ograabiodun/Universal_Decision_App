export function calculateScore(scores: number[]): number {
    return scores.reduce((sum, s) => sum + s, 0);
}

export function getVerdict(score: number): string {
    if (score >= 3) return 'excellent';
    if (score >= 1) return 'acceptable';
    if (score === 0) return 'borderline';
    if (score >= -2) return 'poor';
    return 'critical';
}
