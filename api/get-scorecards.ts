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

        const category = req.query.category as string | undefined;
        const search = req.query.search as string | undefined;
        const verdict = req.query.verdict as string | undefined;
        const mode = req.query.mode as string | undefined;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
        const skip = (page - 1) * limit;

        const filter: any = { userId: user.userId };

        if (category) {
            filter.category = category;
        }

        if (verdict) {
            filter.verdict = verdict;
        }

        if (mode === 'pre') {
            filter.isPreDecision = true;
        } else if (mode === 'post') {
            filter.isPreDecision = false;
        }

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        const db = await getDatabase();
        const collection = db.collection('scorecards');

        const [scorecards, total] = await Promise.all([
            collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            collection.countDocuments(filter)
        ]);

        return res.status(200).json({
            data: scorecards,
            total,
            page,
            limit,
            hasMore: skip + scorecards.length < total
        });
    } catch (error: any) {
        console.error('Error fetching scorecards:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
