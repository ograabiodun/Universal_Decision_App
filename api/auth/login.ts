import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../lib/mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        const db = await getDatabase();
        const users = db.collection('users');

        let user = await users.findOne({ email: email.toLowerCase() });

        if (!user) {
            const newUser = {
                userId: uuidv4(),
                email: email.toLowerCase(),
                token: uuidv4(),
                createdAt: new Date().toISOString()
            };
            await users.insertOne(newUser);
            user = newUser as any;
        }

        return res.status(200).json({
            userId: user!.userId,
            email: user!.email,
            token: user!.token
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ error: error.message || 'Login failed' });
    }
}
