import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './lib/mongodb';
import { getUser } from './lib/auth';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { scorecardId, scores } = req.body;

        if (!scorecardId || !scores) {
            return res.status(400).json({ error: 'Missing scorecardId or scores' });
        }

        const user = await getUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            return res.status(503).json({ error: 'AI insights are not configured. Set OPENAI_API_KEY to enable.' });
        }

        const openaiClient = new OpenAI({ apiKey: openaiKey });

        const prompt = generateInsightPrompt(scores);
        const response = await openaiClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
            temperature: 0.7
        });

        const insights = response.choices[0].message.content;

        const db = await getDatabase();
        await db.collection('scorecards').updateOne(
            { id: scorecardId, userId: user.userId },
            { $set: { aiInsights: insights, updatedAt: new Date().toISOString() } }
        );

        return res.status(200).json({ scorecardId, insights });
    } catch (error: any) {
        console.error('Error generating insights:', error);
        return res.status(500).json({ error: error.message || 'Failed to generate insights' });
    }
}

function generateInsightPrompt(scores: any[]): string {
    const scoreSummary = scores.map((s: any) => {
        const level = s.level || (s.score === 1 ? 'good' : s.score === 0 ? 'partial' : 'none');
        const levelLabel = level === 'good' ? 'Good ✅' : level === 'partial' ? 'Partial ⚠️' : 'None ❌';
        return `${s.pillarName}: ${levelLabel}`;
    }).join('\n');

    const totalScore = scores.reduce((sum: number, s: any) => sum + (s.score || 0), 0);

    return `You are a decision-making coach. A user scored their decision on these 4 pillars (Good = +1, Partial = 0, None = -1):
${scoreSummary}

Total Score: ${totalScore} (range: -4 to +4)

Provide exactly 3 specific, actionable insights to improve their future decision-making. Be encouraging but honest. Focus on the pillars marked "Partial" or "None" as areas for growth. Each insight should be 1-2 sentences. Format as a numbered list.`;
}
