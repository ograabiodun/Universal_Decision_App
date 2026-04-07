import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './lib/mongodb';
import { getVerdict } from './lib/scoring';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const scorecard = req.body;

        // Validate scorecard
        if (!validateScorecard(scorecard)) {
            return res.status(400).json({ error: 'Invalid scorecard data' });
        }

        // Add metadata
        scorecard.id = uuidv4();
        scorecard.createdAt = new Date().toISOString();
        scorecard.userId = req.headers['x-user-id'] || 'anonymous';

        // Calculate total score
        scorecard.totalScore = scorecard.scores.reduce(
            (sum: number, s: any) => sum + s.score,
            0
        );

        // Determine verdict
        scorecard.verdict = getVerdict(scorecard.totalScore);

        // Save to MongoDB
        const db = await getDatabase();
        const result = await db.collection('scorecards').insertOne(scorecard);

        console.log(`Created scorecard ${scorecard.id}`);

        return res.status(201).json({ ...scorecard, _id: result.insertedId });
    } catch (error: any) {
        console.error('Error creating scorecard:', error);
        const message = error?.message || 'Internal server error';
        return res.status(500).json({ error: message });
    }
}

function validateScorecard(scorecard: any): boolean {
    return (
        scorecard &&
        scorecard.category &&
        scorecard.scores &&
        Array.isArray(scorecard.scores) &&
        scorecard.scores.length === 4
    );
}
