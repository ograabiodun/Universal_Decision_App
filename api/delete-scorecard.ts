import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './lib/mongodb';
import { getUser } from './lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'DELETE') {
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
        const result = await db.collection('scorecards').deleteOne({
            id,
            userId: user.userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Scorecard not found' });
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Error deleting scorecard:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
