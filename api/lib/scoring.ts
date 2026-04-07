interface ScoreEntry {
    pillarId: string;
    score: number;
}

export function calculateTotalScore(scores: ScoreEntry[]): number {
    return scores.reduce((sum, s) => sum + s.score, 0);
}

export function getVerdict(totalScore: number): string {
    if (totalScore >= 3) return 'excellent';
    if (totalScore >= 1) return 'acceptable';
    if (totalScore === 0) return 'borderline';
    if (totalScore >= -2) return 'poor';
    return 'critical';
}
