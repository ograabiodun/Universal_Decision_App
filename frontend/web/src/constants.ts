import { PillarDefinition, CategoryInfo } from './types';

export const pillars: PillarDefinition[] = [
    {
        id: 'planning',
        name: 'Planning & Preparation',
        question: 'How well did you plan and prepare for this decision?',
        descriptions: {
            1: 'No plan — acted completely on impulse with no preparation',
            2: 'Minimal — had a vague idea but no real structure',
            3: 'Partial — basic plan exists but with notable gaps',
            4: 'Solid — clear plan with budget/timeline and contingencies',
            5: 'Thorough — comprehensive preparation with backup plans'
        }
    },
    {
        id: 'research',
        name: 'Research & Analysis',
        question: 'How thoroughly did you explore alternatives and gather information?',
        descriptions: {
            1: 'None — made no effort to explore options',
            2: 'Minimal — glanced at a few options without depth',
            3: 'Moderate — explored some alternatives with partial comparison',
            4: 'Good — compared multiple options with some expert input',
            5: 'Extensive — thorough research with data and expert advice'
        }
    },
    {
        id: 'timing',
        name: 'Timing & Urgency',
        question: 'How well-timed was your decision?',
        descriptions: {
            1: 'Terrible — drastically mistimed, caused real harm',
            2: 'Poor — notably too late or too early',
            3: 'Acceptable — not ideal timing but workable',
            4: 'Good — acted at a reasonable time with awareness',
            5: 'Optimal — perfect timing, proactive and prevented issues'
        }
    },
    {
        id: 'emotional',
        name: 'Emotional Control',
        question: 'How calm and rational were you during this decision?',
        descriptions: {
            1: 'None — completely driven by panic, fear, or impulse',
            2: 'Low — emotions heavily influenced the outcome',
            3: 'Mixed — some emotional influence but partly rational',
            4: 'Good — mostly calm and deliberate despite pressure',
            5: 'Full — completely clear-headed and objective'
        }
    }
];

export const categories: CategoryInfo[] = [
    { value: 'career', label: 'Career', icon: '💼', color: '#1565c0', weights: { planning: 1.2, research: 1.3, timing: 1.0, emotional: 0.8 } },
    { value: 'relationships', label: 'Relationships', icon: '❤️', color: '#c62828', weights: { planning: 0.8, research: 0.9, timing: 1.1, emotional: 1.5 } },
    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: '#2e7d32', weights: { planning: 1.0, research: 0.9, timing: 1.1, emotional: 1.3 } },
    { value: 'investments', label: 'Investments', icon: '📈', color: '#e65100', weights: { planning: 1.4, research: 1.4, timing: 1.0, emotional: 0.5 } },
    { value: 'savings', label: 'Savings', icon: '💰', color: '#6a1b9a', weights: { planning: 1.5, research: 1.0, timing: 0.9, emotional: 0.9 } },
    { value: 'purchases', label: 'Purchases', icon: '🛍️', color: '#d32f2f', weights: { planning: 1.2, research: 1.4, timing: 0.8, emotional: 0.9 } },
    { value: 'health', label: 'Health', icon: '🏥', color: '#00838f', weights: { planning: 1.0, research: 1.3, timing: 1.2, emotional: 0.8 } },
    { value: 'education', label: 'Education', icon: '🎓', color: '#283593', weights: { planning: 1.3, research: 1.3, timing: 0.8, emotional: 0.9 } },
    { value: 'business', label: 'Business', icon: '🏢', color: '#4e342e', weights: { planning: 1.3, research: 1.3, timing: 1.0, emotional: 0.7 } }
];

export function calculateWeightedScore(
    scores: { pillarId: string; score: number }[],
    category: string
): number {
    const cat = categories.find(c => c.value === category);
    if (!cat) {
        return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    }
    let weightedSum = 0;
    let totalWeight = 0;
    for (const s of scores) {
        const weight = cat.weights[s.pillarId] || 1.0;
        weightedSum += s.score * weight;
        totalWeight += weight;
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export function getVerdictFromScore(weightedAvg: number): { label: string; color: string; icon: string } {
    const pct = ((weightedAvg - 1) / 4) * 100;
    if (pct >= 85) return { label: 'Excellent', color: '#2e7d32', icon: '🌟' };
    if (pct >= 70) return { label: 'Good', color: '#558b2f', icon: '✅' };
    if (pct >= 50) return { label: 'Fair', color: '#f57f17', icon: '⚠️' };
    if (pct >= 25) return { label: 'Poor', color: '#e65100', icon: '🚩' };
    return { label: 'Critical', color: '#b71c1c', icon: '💥' };
}

export function getScorePercent(weightedAvg: number): number {
    return Math.round(((weightedAvg - 1) / 4) * 100);
}
