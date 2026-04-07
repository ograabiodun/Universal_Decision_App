import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './lib/mongodb';
import { getUser } from './lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await getUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const db = await getDatabase();
        const scorecards = await db.collection('scorecards')
            .find({ userId: user.userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        return res.status(200).json(scorecards);
    } catch (error: any) {
        console.error('Error fetching scorecards:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
