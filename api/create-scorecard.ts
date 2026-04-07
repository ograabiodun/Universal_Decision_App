import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './lib/mongodb';
import { getUser } from './lib/auth';
import { calculateTotalScore, getVerdict, generateServerInsights } from './lib/scoring';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { category, title, scores, isPreDecision, emotionBefore } = req.body;

        if (!category || !title || !scores || !Array.isArray(scores) || scores.length !== 4) {
            return res.status(400).json({ error: 'Invalid scorecard data' });
        }

        const validScores = [-1, 0, 1];
        const validLevels = ['good', 'partial', 'none'];
        for (const s of scores) {
            if (!s.pillarId || typeof s.score !== 'number' || !validScores.includes(s.score)) {
                return res.status(400).json({ error: 'Each score must have pillarId and score (-1, 0, or 1)' });
            }
            if (s.level && !validLevels.includes(s.level)) {
                return res.status(400).json({ error: 'Invalid level value' });
            }
        }

        const user = await getUser(req);
        const userId = user?.userId || 'anonymous';

        const sanitizedScores = scores.map((s: any) => ({
            pillarId: String(s.pillarId),
            pillarName: String(s.pillarName || s.pillarId),
            score: Number(s.score),
            level: String(s.level || 'partial'),
            notes: String(s.notes || '')
        }));

        const totalScore = calculateTotalScore(sanitizedScores);
        const verdict = getVerdict(totalScore);
        const ruleInsights = generateServerInsights(
            sanitizedScores,
            String(category),
            emotionBefore && Array.isArray(emotionBefore.emotions) && emotionBefore.emotions.length > 0
                ? { emotions: emotionBefore.emotions.map((e: any) => String(e)), intensity: Number(emotionBefore.intensity) || 5 }
                : undefined,
            Boolean(isPreDecision)
        );

        const scorecard: any = {
            id: uuidv4(),
            userId,
            category: String(category),
            title: String(title),
            scores: sanitizedScores,
            totalScore,
            verdict,
            ruleInsights,
            isPreDecision: Boolean(isPreDecision),
            createdAt: new Date().toISOString()
        };

        if (emotionBefore && Array.isArray(emotionBefore.emotions) && emotionBefore.emotions.length > 0) {
            scorecard.emotionBefore = {
                emotions: emotionBefore.emotions.map((e: any) => String(e)),
                intensity: Math.min(10, Math.max(1, Number(emotionBefore.intensity) || 5))
            };
        }

        const db = await getDatabase();
        await db.collection('scorecards').insertOne(scorecard);

        return res.status(201).json(scorecard);
    } catch (error: any) {
        console.error('Error creating scorecard:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
