interface ScoreEntry {
    pillarId: string;
    score: number;
}

const categoryWeights: Record<string, Record<string, number>> = {
    career: { planning: 1.2, research: 1.3, timing: 1.0, emotional: 0.8 },
    relationships: { planning: 0.8, research: 0.9, timing: 1.1, emotional: 1.5 },
    family: { planning: 1.0, research: 0.9, timing: 1.1, emotional: 1.3 },
    investments: { planning: 1.4, research: 1.4, timing: 1.0, emotional: 0.5 },
    savings: { planning: 1.5, research: 1.0, timing: 0.9, emotional: 0.9 },
    purchases: { planning: 1.2, research: 1.4, timing: 0.8, emotional: 0.9 },
    health: { planning: 1.0, research: 1.3, timing: 1.2, emotional: 0.8 },
    education: { planning: 1.3, research: 1.3, timing: 0.8, emotional: 0.9 },
    business: { planning: 1.3, research: 1.3, timing: 1.0, emotional: 0.7 }
};

export function calculateWeightedScore(scores: ScoreEntry[], category: string): number {
    const weights = categoryWeights[category];
    if (!weights) {
        return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    }
    let weightedSum = 0;
    let totalWeight = 0;
    for (const s of scores) {
        const weight = weights[s.pillarId] || 1.0;
        weightedSum += s.score * weight;
        totalWeight += weight;
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export function getVerdict(weightedAvg: number): string {
    const pct = ((weightedAvg - 1) / 4) * 100;
    if (pct >= 85) return 'excellent';
    if (pct >= 70) return 'good';
    if (pct >= 50) return 'fair';
    if (pct >= 25) return 'poor';
    return 'critical';
}
