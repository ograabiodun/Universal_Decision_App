import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './lib/mongodb';
import { getUser } from './lib/auth';
import { calculateTotalScore, getVerdict, generateServerInsights } from './lib/scoring';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await getUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const id = req.query.id as string;
        if (!id) {
            return res.status(400).json({ error: 'Scorecard ID is required' });
        }

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

        const updateData: any = {
            category: String(category),
            title: String(title),
            scores: sanitizedScores,
            totalScore,
            verdict,
            ruleInsights,
            isPreDecision: Boolean(isPreDecision),
            updatedAt: new Date().toISOString()
        };

        if (emotionBefore && Array.isArray(emotionBefore.emotions) && emotionBefore.emotions.length > 0) {
            updateData.emotionBefore = {
                emotions: emotionBefore.emotions.map((e: any) => String(e)),
                intensity: Math.min(10, Math.max(1, Number(emotionBefore.intensity) || 5))
            };
        } else {
            updateData.emotionBefore = null;
        }

        const db = await getDatabase();
        const result = await db.collection('scorecards').findOneAndUpdate(
            { id, userId: user.userId },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Scorecard not found' });
        }

        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Error updating scorecard:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
