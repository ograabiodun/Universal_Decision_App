import { CategoryInfo, EmotionOption, ScoreLevel, ScoreValue, VerdictInfo, PillarFeedback, PillarScore, DecisionCategory, EmotionEntry } from './types';

export interface PillarOption {
    level: ScoreLevel;
    value: ScoreValue;
    label: string;
    preDescription: string;
    postDescription: string;
    icon: string;
}

export interface PillarDefinition {
    id: string;
    name: string;
    preQuestion: string;
    postQuestion: string;
    options: PillarOption[];
}

export const pillars: PillarDefinition[] = [
    {
        id: 'planning',
        name: 'Planning & Preparation',
        preQuestion: 'Do you have a budget, timeline, or plan?',
        postQuestion: 'Did you have a budget, timeline, or plan?',
        options: [
            { level: 'good', value: 1, label: 'Yes', preDescription: 'I have a clear plan, budget, or timeline in place', postDescription: 'I had a clear plan, budget, or timeline in place', icon: '✅' },
            { level: 'partial', value: 0, label: 'Partially', preDescription: 'I have a rough idea but nothing structured', postDescription: 'I had a rough idea but nothing structured', icon: '⚠️' },
            { level: 'none', value: -1, label: 'No', preDescription: 'No plan — acting on impulse', postDescription: 'No plan — acted completely on impulse', icon: '❌' }
        ]
    },
    {
        id: 'research',
        name: 'Research & Analysis',
        preQuestion: 'Have you explored alternatives and gathered information?',
        postQuestion: 'Did you explore alternatives and gather information?',
        options: [
            { level: 'good', value: 1, label: 'Yes', preDescription: 'I\'ve compared options and consulted sources', postDescription: 'I compared options and consulted sources', icon: '✅' },
            { level: 'partial', value: 0, label: 'Partially', preDescription: 'Some research, but gaps remain', postDescription: 'Some research was done, but with gaps', icon: '⚠️' },
            { level: 'none', value: -1, label: 'No', preDescription: 'No research — going with first option', postDescription: 'No research — went with first option', icon: '❌' }
        ]
    },
    {
        id: 'timing',
        name: 'Timing & Urgency',
        preQuestion: 'Is the timing right, or are you rushing?',
        postQuestion: 'Was the timing right, or did you rush?',
        options: [
            { level: 'good', value: 1, label: 'Good timing', preDescription: 'This is the right moment — no unnecessary rush', postDescription: 'It was the right moment — no unnecessary rush', icon: '✅' },
            { level: 'partial', value: 0, label: 'Acceptable', preDescription: 'Not ideal timing, but workable', postDescription: 'Not ideal timing, but it worked out', icon: '⚠️' },
            { level: 'none', value: -1, label: 'Rushed / Too late', preDescription: 'Rushing or waiting too long under pressure', postDescription: 'Rushed or waited too long under pressure', icon: '❌' }
        ]
    },
    {
        id: 'emotional',
        name: 'Emotional Control',
        preQuestion: 'Are you feeling calm and rational right now?',
        postQuestion: 'Were you calm and rational during this decision?',
        options: [
            { level: 'good', value: 1, label: 'Calm', preDescription: 'Clear-headed and thinking objectively', postDescription: 'Was clear-headed and thought objectively', icon: '✅' },
            { level: 'partial', value: 0, label: 'Mixed', preDescription: 'Some emotional influence but partly rational', postDescription: 'Some emotional influence but partly rational', icon: '⚠️' },
            { level: 'none', value: -1, label: 'Emotional', preDescription: 'Driven by strong emotions like fear, anger, or excitement', postDescription: 'Was driven by strong emotions', icon: '❌' }
        ]
    }
];

export const emotions: EmotionOption[] = [
    { id: 'anxious', label: 'Anxious', icon: '😰' },
    { id: 'calm', label: 'Calm', icon: '😌' },
    { id: 'uncertain', label: 'Uncertain', icon: '🤔' },
    { id: 'excited', label: 'Excited', icon: '😊' },
    { id: 'confident', label: 'Confident', icon: '💪' },
    { id: 'pressured', label: 'Pressured', icon: '😤' },
    { id: 'hopeful', label: 'Hopeful', icon: '🌟' },
    { id: 'fearful', label: 'Fearful', icon: '😨' }
];

export const categories: CategoryInfo[] = [
    { value: 'career', label: 'Career', icon: '💼', color: '#6366F1' },
    { value: 'relationships', label: 'Relationships', icon: '❤️', color: '#EC4899' },
    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: '#10B981' },
    { value: 'investments', label: 'Investments', icon: '📈', color: '#F59E0B' },
    { value: 'savings', label: 'Savings', icon: '💰', color: '#8B5CF6' },
    { value: 'purchases', label: 'Purchases', icon: '🛍️', color: '#EF4444' },
    { value: 'health', label: 'Health', icon: '🏥', color: '#06B6D4' },
    { value: 'education', label: 'Education', icon: '🎓', color: '#4F46E5' },
    { value: 'business', label: 'Business', icon: '🏢', color: '#78716C' }
];

export function getVerdictFromTotal(totalScore: number): VerdictInfo {
    if (totalScore >= 3) return {
        label: 'Excellent', color: '#10B981', icon: '🌟', band: 'excellent',
        description: 'Your decision process is strong across all pillars. You planned well, researched thoroughly, timed it right, and maintained emotional clarity.',
        recommendation: 'Proceed with confidence. Document what made this process work so you can replicate it in future decisions.'
    };
    if (totalScore >= 1) return {
        label: 'Acceptable', color: '#6366F1', icon: '✅', band: 'acceptable',
        description: 'Your decision has a solid foundation but has gaps in one or more areas. You covered most bases, but some pillars need attention.',
        recommendation: 'Address the weaker pillars before finalizing. A small pause to shore up weak spots could significantly improve your outcome.'
    };
    if (totalScore === 0) return {
        label: 'Borderline', color: '#F59E0B', icon: '⚠️', band: 'borderline',
        description: 'Your decision process is evenly split between strengths and weaknesses. The risk of a poor outcome is real without improvement.',
        recommendation: 'Pause if possible. Focus on the pillars marked "None" — improving even one would shift this into positive territory.'
    };
    if (totalScore >= -2) return {
        label: 'Poor', color: '#F97316', icon: '🚩', band: 'poor',
        description: 'Multiple pillars are weak. This decision is being made without adequate preparation, research, timing, or emotional clarity.',
        recommendation: 'Strongly consider delaying this decision. Identify which pillars you can improve most quickly and work on those first.'
    };
    return {
        label: 'Critical', color: '#EF4444', icon: '💥', band: 'critical',
        description: 'Nearly all pillars show significant gaps. This decision carries very high risk of regret and is likely driven by impulse or pressure.',
        recommendation: 'Stop and step back. This is not the time to decide. Seek outside perspective, do research, and revisit when you feel calmer.'
    };
}

export function getLevelLabel(level: ScoreLevel): { label: string; color: string; icon: string } {
    switch (level) {
        case 'good': return { label: 'Good', color: '#10B981', icon: '✅' };
        case 'partial': return { label: 'Partial', color: '#F59E0B', icon: '⚠️' };
        case 'none': return { label: 'None', color: '#EF4444', icon: '❌' };
    }
}

const pillarFeedbackMap: Record<string, Record<ScoreLevel, { feedback: string; actionItem: string }>> = {
    planning: {
        good: { feedback: 'Your planning is solid — clear budget, timeline, or structured approach in place.', actionItem: 'Keep documenting your plans; this discipline is working for you.' },
        partial: { feedback: 'You have a rough idea but lack structure. Vague plans lead to vague outcomes.', actionItem: 'Write down specific numbers, dates, and milestones before proceeding.' },
        none: { feedback: 'No plan at all — this is impulse territory. Most regretted decisions start here.', actionItem: 'Create a basic plan: What\'s the budget? Timeline? What does success look like?' }
    },
    research: {
        good: { feedback: 'You\'ve done your homework — compared options and consulted sources.', actionItem: 'Consider sharing findings with a trusted advisor for a second opinion.' },
        partial: { feedback: 'Some research done, but gaps remain. You may be missing critical alternatives.', actionItem: 'Spend 30 more minutes exploring at least 2 alternatives before committing.' },
        none: { feedback: 'No research — going with the first option. This is how people overpay and miss better choices.', actionItem: 'Find at least 3 alternatives and compare them on price, quality, and fit.' }
    },
    timing: {
        good: { feedback: 'The timing feels right — no unnecessary rush or prolonged delay.', actionItem: 'Trust your timing instinct, but set a deadline to prevent second-guessing.' },
        partial: { feedback: 'The timing isn\'t ideal but workable. You may be slightly rushed or late.', actionItem: 'Ask: "If I waited one more week, would the outcome improve?" If yes, wait.' },
        none: { feedback: 'You\'re rushing or acting under pressure. Urgency is the enemy of good decisions.', actionItem: 'Challenge the urgency: Is the deadline real or artificial? Can you buy more time?' }
    },
    emotional: {
        good: { feedback: 'You\'re thinking clearly and objectively. Emotions are in check.', actionItem: 'If strong emotions arise later, revisit your reasoning written here.' },
        partial: { feedback: 'Emotions are influencing you but you\'re partly rational. Watch for bias creep.', actionItem: 'Write down your reasoning now while clear-headed. Review it in 24 hours.' },
        none: { feedback: 'Strong emotions are driving this decision. Fear, excitement, or pressure often lead to regret.', actionItem: 'Do NOT decide today. Sleep on it. Talk to someone neutral first.' }
    }
};

export function getPillarFeedback(pillarId: string, pillarName: string, level: ScoreLevel): PillarFeedback {
    const map = pillarFeedbackMap[pillarId];
    if (map && map[level]) {
        return { pillarId, pillarName, level, ...map[level] };
    }
    return {
        pillarId, pillarName, level,
        feedback: level === 'good' ? 'This pillar is strong.' : level === 'partial' ? 'This pillar needs improvement.' : 'This pillar is a significant gap.',
        actionItem: level === 'good' ? 'Keep up the good work.' : 'Focus on strengthening this area.'
    };
}

export function generateRuleBasedInsights(
    scores: PillarScore[],
    category: DecisionCategory,
    emotionBefore?: EmotionEntry,
    isPreDecision?: boolean
): string[] {
    const insights: string[] = [];
    const nonePillars = scores.filter(s => s.level === 'none');
    const partialPillars = scores.filter(s => s.level === 'partial');
    const goodPillars = scores.filter(s => s.level === 'good');
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

    if (nonePillars.length >= 3) {
        insights.push('\u{1F6A8} Three or more pillars show no preparation. This suggests an impulsive decision. Slow down and address at least two weak areas before committing.');
    } else if (nonePillars.length === 2) {
        insights.push(`\u26A0\uFE0F Significant gaps in ${nonePillars.map(p => p.pillarName).join(' and ')}. These are the areas most likely to cause regret. Focus there before finalizing.`);
    } else if (goodPillars.length >= 3) {
        insights.push(`\u{1F4AA} Strong process across ${goodPillars.map(p => p.pillarName).join(', ')}. You're in a good position to make a confident decision.`);
    } else if (partialPillars.length >= 2) {
        insights.push(`Your decision has potential but ${partialPillars.map(p => p.pillarName).join(' and ')} need more work. Small improvements can shift your outcome significantly.`);
    } else {
        insights.push('Your decision has a mix of strengths and weaknesses. Target the weakest pillar first — small improvements there have the biggest impact.');
    }

    const categoryInsights: Record<string, string> = {
        career: '\u{1F4BC} Career decisions compound over time. Even a small improvement in your process now can redirect your trajectory significantly.',
        relationships: '\u2764\uFE0F Relationship decisions are heavily emotional. If Emotional Control is low, consider whether you\'re reacting to a moment or making a lasting choice.',
        investments: '\u{1F4C8} Investment decisions demand research above all. If Research scored low, you\'re essentially gambling.',
        purchases: '\u{1F6CD}\uFE0F Purchase decisions benefit most from planning and timing. Waiting 48 hours before big purchases eliminates most impulse regret.',
        family: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466} Family decisions affect more than just you. Discuss your reasoning with those impacted before committing.',
        savings: '\u{1F4B0} Savings decisions are about discipline, not information. If planning is strong but action is weak, automate it.',
        health: '\u{1F3E5} Health decisions deserve extra research. The cost of being wrong is high and often irreversible.',
        education: '\u{1F393} Education is a long-term investment. Planning and research matter more here than timing or emotion.',
        business: '\u{1F3E2} Business decisions should be data-driven. If research is weak, you\'re betting on intuition — which fails at scale.'
    };
    if (categoryInsights[category]) {
        insights.push(categoryInsights[category]);
    }

    if (emotionBefore && emotionBefore.emotions.length > 0) {
        const negativeEmotions = ['anxious', 'pressured', 'fearful', 'uncertain'];
        const activeNegative = emotionBefore.emotions.filter(e => negativeEmotions.includes(e));
        if (activeNegative.length > 0 && emotionBefore.intensity >= 7) {
            const emotionalPillar = scores.find(s => s.pillarId === 'emotional');
            if (emotionalPillar && emotionalPillar.level !== 'good') {
                insights.push(`\u{1F534} High emotional intensity (${emotionBefore.intensity}/10) with weak Emotional Control is a red flag. Wait until intensity drops below 5 before deciding.`);
            } else {
                insights.push(`You're experiencing strong emotions at intensity ${emotionBefore.intensity}/10, but your Emotional Control is solid. Stay vigilant — emotions can shift under pressure.`);
            }
        } else if (emotionBefore.emotions.includes('confident') && goodPillars.length <= 1) {
            insights.push('\u26A0\uFE0F You feel confident, but your pillar scores tell a different story. Overconfidence with weak preparation is a common decision trap.');
        }
    }

    if (isPreDecision && totalScore <= 0) {
        insights.push('\u{1F52E} Since this is a pre-decision audit, you still have time to improve. Focus on the weakest pillar — even 30 minutes of effort can shift the outcome.');
    } else if (!isPreDecision) {
        insights.push('\u{1F50D} This post-decision review builds self-awareness. Note which pillars were weakest — these are patterns to watch in future decisions.');
    }

    return insights.slice(0, 4);
}
