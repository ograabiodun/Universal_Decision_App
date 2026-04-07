interface ScoreEntry {
    pillarId: string;
    pillarName?: string;
    score: number;
    level?: string;
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

const categoryInsightMap: Record<string, string> = {
    career: '💼 Career decisions compound over time. Even a small improvement in your process now can redirect your trajectory significantly.',
    relationships: '❤️ Relationship decisions are heavily emotional. If Emotional Control is low, consider whether you\'re reacting to a moment or making a lasting choice.',
    investments: '📈 Investment decisions demand research above all. If Research scored low, you\'re essentially gambling.',
    purchases: '🛍️ Purchase decisions benefit most from planning and timing. Waiting 48 hours before big purchases eliminates most impulse regret.',
    family: '👨‍👩‍👧‍👦 Family decisions affect more than just you. Discuss your reasoning with those impacted before committing.',
    savings: '💰 Savings decisions are about discipline, not information. If planning is strong but action is weak, automate it.',
    health: '🏥 Health decisions deserve extra research. The cost of being wrong is high and often irreversible.',
    education: '🎓 Education is a long-term investment. Planning and research matter more here than timing or emotion.',
    business: '🏢 Business decisions should be data-driven. If research is weak, you\'re betting on intuition — which fails at scale.'
};

export function generateServerInsights(
    scores: ScoreEntry[],
    category?: string,
    emotionBefore?: { emotions: string[]; intensity: number },
    isPreDecision?: boolean
): string[] {
    const insights: string[] = [];
    const nonePillars = scores.filter(s => s.level === 'none');
    const partialPillars = scores.filter(s => s.level === 'partial');
    const goodPillars = scores.filter(s => s.level === 'good');
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

    if (nonePillars.length >= 3) {
        insights.push('🚨 Three or more pillars show no preparation. This suggests an impulsive decision. Slow down and address at least two weak areas before committing.');
    } else if (nonePillars.length === 2) {
        insights.push(`⚠️ Significant gaps in ${nonePillars.map(p => p.pillarName || p.pillarId).join(' and ')}. These are the areas most likely to cause regret.`);
    } else if (goodPillars.length >= 3) {
        insights.push(`💪 Strong process across ${goodPillars.map(p => p.pillarName || p.pillarId).join(', ')}. You're well-positioned to decide with confidence.`);
    } else if (partialPillars.length >= 2) {
        insights.push(`Your decision has potential but ${partialPillars.map(p => p.pillarName || p.pillarId).join(' and ')} need more work.`);
    } else {
        insights.push('Your decision has a mix of strengths and weaknesses. Target the weakest pillar first.');
    }

    if (category && categoryInsightMap[category]) {
        insights.push(categoryInsightMap[category]);
    }

    if (emotionBefore && emotionBefore.emotions.length > 0) {
        const negativeEmotions = ['anxious', 'pressured', 'fearful', 'uncertain'];
        const activeNegative = emotionBefore.emotions.filter((e: string) => negativeEmotions.includes(e));
        if (activeNegative.length > 0 && emotionBefore.intensity >= 7) {
            const emotionalPillar = scores.find(s => s.pillarId === 'emotional');
            if (emotionalPillar && emotionalPillar.level !== 'good') {
                insights.push(`🔴 High emotional intensity (${emotionBefore.intensity}/10) with weak Emotional Control is a red flag. Wait until intensity drops below 5.`);
            }
        } else if (emotionBefore.emotions.includes('confident') && goodPillars.length <= 1) {
            insights.push('⚠️ You feel confident, but your pillar scores suggest otherwise. Overconfidence with weak preparation is a common trap.');
        }
    }

    if (isPreDecision && totalScore <= 0) {
        insights.push('🔮 Since this is a pre-decision audit, you still have time to improve. Focus on the weakest pillar.');
    } else if (isPreDecision === false) {
        insights.push('🔍 This post-decision review builds self-awareness. Note which pillars were weakest for future decisions.');
    }

    return insights.slice(0, 4);
}
