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

export interface PillarDefinition {
    id: string;
    name: string;
    question: string;
    descriptions: Record<number, string>;
}

export interface PillarScore {
    pillarId: string;
    pillarName: string;
    score: number;
    notes: string;
}

export interface Scorecard {
    id: string;
    _id?: string;
    userId: string;
    category: DecisionCategory;
    title: string;
    scores: PillarScore[];
    totalScore: number;
    weightedScore: number;
    verdict: string;
    isPreDecision: boolean;
    aiInsights?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CategoryInfo {
    value: DecisionCategory;
    label: string;
    icon: string;
    color: string;
    weights: Record<string, number>;
}

export interface AuthUser {
    userId: string;
    email: string;
    token: string;
}
