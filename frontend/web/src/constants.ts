import { CategoryInfo, EmotionOption, ScoreLevel, ScoreValue } from './types';

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

export function getVerdictFromTotal(totalScore: number): { label: string; color: string; icon: string } {
    if (totalScore >= 3) return { label: 'Excellent', color: '#10B981', icon: '🌟' };
    if (totalScore >= 1) return { label: 'Acceptable', color: '#6366F1', icon: '✅' };
    if (totalScore === 0) return { label: 'Borderline', color: '#F59E0B', icon: '⚠️' };
    if (totalScore >= -2) return { label: 'Poor', color: '#F97316', icon: '🚩' };
    return { label: 'Critical', color: '#EF4444', icon: '💥' };
}

export function getLevelLabel(level: ScoreLevel): { label: string; color: string; icon: string } {
    switch (level) {
        case 'good': return { label: 'Good', color: '#10B981', icon: '✅' };
        case 'partial': return { label: 'Partial', color: '#F59E0B', icon: '⚠️' };
        case 'none': return { label: 'None', color: '#EF4444', icon: '❌' };
    }
}
