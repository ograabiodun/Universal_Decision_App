import { Scorecard, DecisionCategory, ScoreLevel, CategoryAnalytics, DecisionProfile } from '../types';
import { categories, emotions, getVerdictFromTotal } from '../constants';

export function buildCategoryAnalytics(scorecards: Scorecard[]): CategoryAnalytics[] {
    const groups: Record<string, Scorecard[]> = {};
    for (const sc of scorecards) {
        if (!groups[sc.category]) groups[sc.category] = [];
        groups[sc.category].push(sc);
    }

    return Object.entries(groups).map(([cat, cards]) => {
        const avg = cards.reduce((sum, s) => sum + s.totalScore, 0) / cards.length;
        const catInfo = categories.find(c => c.value === cat);

        const pillarTotals: Record<string, { sum: number; count: number; name: string }> = {};
        for (const card of cards) {
            for (const score of card.scores) {
                if (!pillarTotals[score.pillarId]) pillarTotals[score.pillarId] = { sum: 0, count: 0, name: score.pillarName };
                pillarTotals[score.pillarId].sum += score.score;
                pillarTotals[score.pillarId].count++;
            }
        }
        const pillarAvgs = Object.entries(pillarTotals)
            .map(([id, t]) => ({ id, name: t.name, avg: t.sum / t.count }));
        const sorted = [...pillarAvgs].sort((a, b) => b.avg - a.avg);

        return {
            category: cat as DecisionCategory,
            label: catInfo?.label || cat,
            icon: catInfo?.icon || '',
            color: catInfo?.color || '#666',
            count: cards.length,
            avgScore: Math.round(avg * 10) / 10,
            strongestPillar: sorted[0]?.name || '',
            weakestPillar: sorted[sorted.length - 1]?.name || ''
        };
    });
}

export function buildDecisionProfile(scorecards: Scorecard[]): DecisionProfile | null {
    if (scorecards.length < 2) return null;

    const overallAvg = scorecards.reduce((sum, s) => sum + s.totalScore, 0) / scorecards.length;
    const categoryBreakdown = buildCategoryAnalytics(scorecards);
    const sortedCats = [...categoryBreakdown].sort((a, b) => b.avgScore - a.avgScore);

    const pillarTotals: Record<string, { sum: number; count: number; name: string }> = {};
    for (const sc of scorecards) {
        for (const score of sc.scores) {
            if (!pillarTotals[score.pillarId]) pillarTotals[score.pillarId] = { sum: 0, count: 0, name: score.pillarName };
            pillarTotals[score.pillarId].sum += score.score;
            pillarTotals[score.pillarId].count++;
        }
    }
    const pillarAverages = Object.entries(pillarTotals).map(([id, t]) => ({
        pillarId: id,
        pillarName: t.name,
        avg: Math.round((t.sum / t.count) * 10) / 10,
        level: (t.sum / t.count >= 0.5 ? 'good' : t.sum / t.count >= -0.3 ? 'partial' : 'none') as ScoreLevel
    }));

    const emotionCounts: Record<string, number> = {};
    for (const sc of scorecards) {
        if (sc.emotionBefore?.emotions) {
            for (const eid of sc.emotionBefore.emotions) {
                emotionCounts[eid] = (emotionCounts[eid] || 0) + 1;
            }
        }
    }
    const dominantEmotions = Object.entries(emotionCounts)
        .map(([id, count]) => {
            const em = emotions.find(e => e.id === id);
            return { emotionId: id, label: em?.label || id, icon: em?.icon || '', count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const sortedPillars = [...pillarAverages].sort((a, b) => b.avg - a.avg);
    const strongestPillarId = sortedPillars[0]?.pillarId;
    const weakestPillarId = sortedPillars[sortedPillars.length - 1]?.pillarId;

    let profileType = 'The Balanced Thinker';
    let profileDescription = 'You approach decisions with a relatively even hand across all areas.';

    if (strongestPillarId === 'research' && (weakestPillarId === 'timing' || weakestPillarId === 'emotional')) {
        profileType = 'The Analyst';
        profileDescription = 'You excel at research but may overthink or let emotions creep in. Trust your data more and set decision deadlines.';
    } else if (strongestPillarId === 'planning' && weakestPillarId === 'emotional') {
        profileType = 'The Strategist';
        profileDescription = 'Great planner but emotions sometimes derail your strategy. Build in cooling-off periods before big choices.';
    } else if (strongestPillarId === 'emotional' && (weakestPillarId === 'research' || weakestPillarId === 'planning')) {
        profileType = 'The Intuitive';
        profileDescription = 'Emotionally grounded but light on preparation. Back your good instincts with more research and structured planning.';
    } else if (strongestPillarId === 'timing' && weakestPillarId === 'research') {
        profileType = 'The Opportunist';
        profileDescription = 'You have a good sense of timing but may act before doing homework. Pair your timing instinct with better research.';
    } else if (strongestPillarId === 'planning' && weakestPillarId === 'research') {
        profileType = 'The Planner';
        profileDescription = 'You plan well but skip the research phase. Your plans would be stronger if backed by data and alternatives.';
    } else if (overallAvg >= 2) {
        profileType = 'The Deliberate Decision-Maker';
        profileDescription = 'You consistently score well across pillars. Keep refining your process and share what works with others.';
    } else if (overallAvg <= -1) {
        profileType = 'The Impulsive';
        profileDescription = 'Decisions are often made without adequate preparation. Building any single habit — planning, research, or waiting — would dramatically improve outcomes.';
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const p of pillarAverages) {
        const sign = p.avg > 0 ? '+' : '';
        if (p.avg >= 0.5) strengths.push(`Strong ${p.pillarName} (avg ${sign}${p.avg})`);
        if (p.avg <= -0.3) weaknesses.push(`Weak ${p.pillarName} (avg ${sign}${p.avg})`);
    }
    if (sortedCats.length > 1 && sortedCats[0].avgScore >= 1) {
        strengths.push(`Best in ${sortedCats[0].icon} ${sortedCats[0].label} decisions (avg +${sortedCats[0].avgScore})`);
    }
    if (sortedCats.length > 1 && sortedCats[sortedCats.length - 1].avgScore <= 0) {
        const w = sortedCats[sortedCats.length - 1];
        weaknesses.push(`Weakest in ${w.icon} ${w.label} decisions (avg ${w.avgScore})`);
    }

    return {
        totalDecisions: scorecards.length,
        overallAvgScore: Math.round(overallAvg * 10) / 10,
        strongestCategory: sortedCats.length > 0 ? sortedCats[0] : null,
        weakestCategory: sortedCats.length > 1 ? sortedCats[sortedCats.length - 1] : null,
        categoryBreakdown,
        pillarAverages,
        dominantEmotions,
        profileType,
        profileDescription,
        strengths,
        weaknesses
    };
}
