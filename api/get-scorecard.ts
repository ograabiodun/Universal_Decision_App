import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './lib/mongodb';
import { getUser } from './lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Scorecard ID required' });
        }

        const user = await getUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const db = await getDatabase();
        const scorecard = await db.collection('scorecards').findOne({
            id,
            userId: user.userId
        });

        if (!scorecard) {
            return res.status(404).json({ error: 'Scorecard not found' });
        }

        return res.status(200).json(scorecard);
    } catch (error: any) {
        console.error('Error fetching scorecard:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
