export type DecisionCategory =
    | 'career'
    | 'relationships'
    | 'family'
    | 'investments'
    | 'savings'
    | 'purchases'
    | 'health'
    | 'education'
    | 'business';

export type ScoreValue = -1 | 0 | 1;
export type ScoreLevel = 'good' | 'partial' | 'none';

export interface PillarScore {
    pillarId: string;
    pillarName: string;
    score: ScoreValue;
    level: ScoreLevel;
    notes: string;
}

export interface EmotionEntry {
    emotions: string[];
    intensity: number;
}

export interface Scorecard {
    id: string;
    _id?: string;
    userId: string;
    category: DecisionCategory;
    title: string;
    scores: PillarScore[];
    totalScore: number;
    verdict: string;
    isPreDecision: boolean;
    emotionBefore?: EmotionEntry;
    aiInsights?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CategoryInfo {
    value: DecisionCategory;
    label: string;
    icon: string;
    color: string;
}

export interface EmotionOption {
    id: string;
    label: string;
    icon: string;
}

export interface AuthUser {
    userId: string;
    email: string;
    token: string;
}
