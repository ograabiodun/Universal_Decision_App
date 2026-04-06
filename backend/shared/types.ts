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

export interface DecisionPillar {
    name: string;
    question: string;
    good: string;
    bad: string;
    ugly: string;
}

export interface DecisionScorecard {
    id: string;
    userId: string;
    category: DecisionCategory;
    title: string;
    date: Date;
    scores: PillarScore[];
    totalScore: number;
    verdict: ScoreVerdict;
    insights: string;
    isPreDecision: boolean;
}

export interface PillarScore {
    pillarName: string;
    score: -1 | 0 | 1;
    notes: string;
}

export type ScoreVerdict = 'excellent' | 'acceptable' | 'borderline' | 'poor' | 'critical';