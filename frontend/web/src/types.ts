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

export interface Outcome {
    result: 'positive' | 'neutral' | 'negative';
    notes: string;
    recordedAt: string;
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
    outcome?: Outcome;
    aiInsights?: string;
    ruleInsights?: string[];
    linkedScorecardId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ScorecardFilters {
    category?: DecisionCategory;
    search?: string;
    verdict?: string;
    mode?: 'pre' | 'post';
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
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

export interface VerdictInfo {
    label: string;
    color: string;
    icon: string;
    description: string;
    recommendation: string;
    band: 'excellent' | 'acceptable' | 'borderline' | 'poor' | 'critical';
}

export interface PillarFeedback {
    pillarId: string;
    pillarName: string;
    level: ScoreLevel;
    feedback: string;
    actionItem: string;
}

export interface CategoryAnalytics {
    category: DecisionCategory;
    label: string;
    icon: string;
    color: string;
    count: number;
    avgScore: number;
    strongestPillar: string;
    weakestPillar: string;
}

export interface DecisionProfile {
    totalDecisions: number;
    overallAvgScore: number;
    strongestCategory: CategoryAnalytics | null;
    weakestCategory: CategoryAnalytics | null;
    categoryBreakdown: CategoryAnalytics[];
    pillarAverages: { pillarId: string; pillarName: string; avg: number; level: ScoreLevel }[];
    dominantEmotions: { emotionId: string; label: string; icon: string; count: number }[];
    profileType: string;
    profileDescription: string;
    strengths: string[];
    weaknesses: string[];
}

export interface PatternWarning {
    type: 'recurring_weakness' | 'emotion_correlation' | 'category_blindspot' | 'declining_trend' | 'improving_trend' | 'streak';
    severity: 'info' | 'warning' | 'critical';
    icon: string;
    title: string;
    message: string;
    pillarId?: string;
    category?: DecisionCategory;
}
