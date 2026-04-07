import { Scorecard, DecisionCategory, ScoreLevel, CategoryAnalytics, DecisionProfile, PatternWarning } from '../types';
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

export function detectPatterns(
    scorecards: Scorecard[],
    currentCategory?: DecisionCategory
): PatternWarning[] {
    const warnings: PatternWarning[] = [];
    if (scorecards.length < 3) return warnings;

    const sorted = [...scorecards].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const recent = sorted.slice(0, Math.min(10, sorted.length));
    const overallAvg = scorecards.reduce((sum, s) => sum + s.totalScore, 0) / scorecards.length;

    // 1. Recurring pillar weakness
    const pillarIds = ['planning', 'research', 'timing', 'emotional'];
    for (const pid of pillarIds) {
        const recentScores = recent
            .map(sc => sc.scores.find(s => s.pillarId === pid))
            .filter(Boolean) as { pillarId: string; pillarName: string; level: string; score: number }[];

        if (recentScores.length < 3) continue;

        const noneCount = recentScores.filter(s => s.level === 'none').length;
        const partialCount = recentScores.filter(s => s.level === 'partial').length;
        const pillarName = recentScores[0].pillarName;

        if (noneCount >= 3) {
            warnings.push({
                type: 'recurring_weakness',
                severity: noneCount >= 4 ? 'critical' : 'warning',
                icon: '🔁',
                title: `Recurring gap: ${pillarName}`,
                message: `You've scored "None" on ${pillarName} in ${noneCount} of your last ${recentScores.length} decisions. This is a persistent blind spot that's costing you.`,
                pillarId: pid
            });
        } else if (noneCount + partialCount >= Math.ceil(recentScores.length * 0.7) && recentScores.length >= 4) {
            warnings.push({
                type: 'recurring_weakness',
                severity: 'warning',
                icon: '🔁',
                title: `Weak pattern: ${pillarName}`,
                message: `${pillarName} is consistently weak or partial in ${noneCount + partialCount} of ${recentScores.length} recent decisions. Targeted improvement here would lift your overall scores.`,
                pillarId: pid
            });
        }
    }

    // 2. Emotion-score correlation
    const emotionScorePairs: Record<string, number[]> = {};
    for (const sc of scorecards) {
        if (sc.emotionBefore?.emotions) {
            for (const eid of sc.emotionBefore.emotions) {
                if (!emotionScorePairs[eid]) emotionScorePairs[eid] = [];
                emotionScorePairs[eid].push(sc.totalScore);
            }
        }
    }

    for (const [eid, scores] of Object.entries(emotionScorePairs)) {
        if (scores.length < 2) continue;
        const emotionAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const em = emotions.find(e => e.id === eid);
        const roundedEmotionAvg = Math.round(emotionAvg * 10) / 10;
        const roundedOverallAvg = Math.round(overallAvg * 10) / 10;

        if (emotionAvg <= -1 && emotionAvg < overallAvg - 1) {
            warnings.push({
                type: 'emotion_correlation',
                severity: 'warning',
                icon: em?.icon || '😰',
                title: `${em?.label || eid} leads to poor decisions`,
                message: `When you feel ${em?.label || eid}, your average score is ${roundedEmotionAvg > 0 ? '+' : ''}${roundedEmotionAvg} vs your overall ${roundedOverallAvg > 0 ? '+' : ''}${roundedOverallAvg}. Consider waiting until this feeling passes.`
            });
        } else if (emotionAvg >= 1.5 && emotionAvg > overallAvg + 0.5 && scores.length >= 3) {
            warnings.push({
                type: 'emotion_correlation',
                severity: 'info',
                icon: em?.icon || '✨',
                title: `${em?.label || eid} correlates with good decisions`,
                message: `When feeling ${em?.label || eid}, your average score is ${roundedEmotionAvg > 0 ? '+' : ''}${roundedEmotionAvg}. You tend to decide more carefully in this state.`
            });
        }
    }

    // 3. Category-specific blind spots
    if (currentCategory) {
        const catCards = scorecards.filter(sc => sc.category === currentCategory);
        if (catCards.length >= 2) {
            const pillarTotals: Record<string, { sum: number; count: number; name: string }> = {};
            for (const sc of catCards) {
                for (const s of sc.scores) {
                    if (!pillarTotals[s.pillarId]) pillarTotals[s.pillarId] = { sum: 0, count: 0, name: s.pillarName };
                    pillarTotals[s.pillarId].sum += s.score;
                    pillarTotals[s.pillarId].count++;
                }
            }
            for (const [pid, data] of Object.entries(pillarTotals)) {
                const avg = data.sum / data.count;
                if (avg <= -0.5 && data.count >= 2) {
                    const catInfo = categories.find(c => c.value === currentCategory);
                    warnings.push({
                        type: 'category_blindspot',
                        severity: 'warning',
                        icon: '🎯',
                        title: `${catInfo?.icon || ''} ${catInfo?.label || currentCategory}: Always weak on ${data.name}`,
                        message: `In ${catInfo?.label || currentCategory} decisions, your ${data.name} averages ${avg > 0 ? '+' : ''}${Math.round(avg * 10) / 10}. Make a conscious effort to address ${data.name} next time.`,
                        pillarId: pid,
                        category: currentCategory
                    });
                }
            }
        }
    }

    // 4. Trend detection (first half vs second half)
    if (sorted.length >= 6) {
        const midpoint = Math.floor(sorted.length / 2);
        const recentHalf = sorted.slice(0, midpoint);
        const olderHalf = sorted.slice(midpoint);
        const recentAvg = recentHalf.reduce((sum, s) => sum + s.totalScore, 0) / recentHalf.length;
        const olderAvg = olderHalf.reduce((sum, s) => sum + s.totalScore, 0) / olderHalf.length;
        const roundedRecent = Math.round(recentAvg * 10) / 10;
        const roundedOlder = Math.round(olderAvg * 10) / 10;

        if (recentAvg < olderAvg - 1) {
            warnings.push({
                type: 'declining_trend',
                severity: 'warning',
                icon: '📉',
                title: 'Declining decision quality',
                message: `Your recent decisions average ${roundedRecent > 0 ? '+' : ''}${roundedRecent} vs ${roundedOlder > 0 ? '+' : ''}${roundedOlder} earlier. Something may be affecting your process — stress, time pressure, or fatigue.`
            });
        } else if (recentAvg > olderAvg + 1) {
            warnings.push({
                type: 'improving_trend',
                severity: 'info',
                icon: '📈',
                title: 'Your decisions are improving!',
                message: `Recent decisions average ${roundedRecent > 0 ? '+' : ''}${roundedRecent} vs ${roundedOlder > 0 ? '+' : ''}${roundedOlder} earlier. Your self-awareness is paying off.`
            });
        }
    }

    // 5. Streak detection
    if (sorted.length >= 3) {
        const streakScores = sorted.slice(0, 5).map(s => s.totalScore);
        const badStreak = streakScores.filter(s => s <= 0).length;
        const goodStreak = streakScores.filter(s => s >= 2).length;

        if (badStreak >= 3) {
            warnings.push({
                type: 'streak',
                severity: 'critical',
                icon: '🛑',
                title: 'Multiple poor decisions in a row',
                message: `Your last ${badStreak} decisions scored ≤0. This is a pattern, not bad luck. Consider stepping back from major decisions this week and reflecting on what's driving it.`
            });
        } else if (goodStreak >= 3) {
            warnings.push({
                type: 'streak',
                severity: 'info',
                icon: '🔥',
                title: 'You\'re on a great streak!',
                message: `Your last ${goodStreak} decisions all scored +2 or better. Your decision process is consistently strong right now.`
            });
        }
    }

    const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
    return warnings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
