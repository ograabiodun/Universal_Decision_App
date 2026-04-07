import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../lib/mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password, mode } = req.body;

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const db = await getDatabase();
        const users = db.collection('users');
        const normalizedEmail = email.toLowerCase();
        const existingUser = await users.findOne({ email: normalizedEmail });

        if (mode === 'register') {
            if (existingUser) {
                return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newToken = uuidv4();
            const newUser = {
                userId: uuidv4(),
                email: normalizedEmail,
                password: hashedPassword,
                token: newToken,
                createdAt: new Date().toISOString()
            };
            await users.insertOne(newUser);

            return res.status(201).json({
                userId: newUser.userId,
                email: newUser.email,
                token: newUser.token
            });
        }

        // Login mode (default)
        if (!existingUser) {
            return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
        }

        // Support legacy accounts (no password) — let them set one
        if (!existingUser.password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newToken = uuidv4();
            await users.updateOne(
                { email: normalizedEmail },
                { $set: { password: hashedPassword, token: newToken } }
            );
            return res.status(200).json({
                userId: existingUser.userId,
                email: existingUser.email,
                token: newToken
            });
        }

        const passwordValid = await bcrypt.compare(password, existingUser.password);
        if (!passwordValid) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Rotate token on each login
        const newToken = uuidv4();
        await users.updateOne(
            { email: normalizedEmail },
            { $set: { token: newToken } }
        );

        return res.status(200).json({
            userId: existingUser.userId,
            email: existingUser.email,
            token: newToken
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ error: error.message || 'Login failed' });
    }
}
