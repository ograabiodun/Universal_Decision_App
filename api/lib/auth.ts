import { getDatabase } from './mongodb';
import type { VercelRequest } from '@vercel/node';

export async function getUser(req: VercelRequest) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return null;
    }
    const token = auth.slice(7);
    if (!token) return null;

    const db = await getDatabase();
    return db.collection('users').findOne({ token });
}
