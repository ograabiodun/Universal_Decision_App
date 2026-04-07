import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './lib/mongodb';
import { getUser } from './lib/auth';

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

        const { result, notes } = req.body;

        const validResults = ['positive', 'neutral', 'negative'];
        if (!result || !validResults.includes(result)) {
            return res.status(400).json({ error: 'Result must be positive, neutral, or negative' });
        }

        const outcome = {
            result: String(result),
            notes: String(notes || ''),
            recordedAt: new Date().toISOString()
        };

        const db = await getDatabase();
        const updated = await db.collection('scorecards').findOneAndUpdate(
            { id, userId: user.userId },
            { $set: { outcome, updatedAt: new Date().toISOString() } },
            { returnDocument: 'after' }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Scorecard not found' });
        }

        return res.status(200).json(updated);
    } catch (error: any) {
        console.error('Error updating outcome:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
