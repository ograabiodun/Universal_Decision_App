import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './lib/mongodb';
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

        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            return res.status(500).json({ error: 'OpenAI not configured' });
        }

        const openaiClient = new OpenAI({ apiKey: openaiKey });

        // Generate AI insights based on scores
        const prompt = generateInsightPrompt(scores);

        const response = await openaiClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200,
            temperature: 0.7
        });

        const insights = response.choices[0].message.content;

        // Update scorecard in MongoDB
        const db = await getDatabase();
        await db.collection('scorecards').updateOne(
            { id: scorecardId },
            { $set: { aiInsights: insights } }
        );

        console.log(`Generated insights for scorecard ${scorecardId}`);

        return res.status(200).json({ scorecardId, insights });
    } catch (error) {
        console.error('Error generating insights:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function generateInsightPrompt(scores: any[]): string {
    const scoreSummary = scores.map((s: any) =>
        `${s.pillarName}: ${s.score === 1 ? 'Good' : s.score === 0 ? 'Bad' : 'Ugly'}`
    ).join('\n');

    return `Based on these decision scores:
${scoreSummary}

Provide 3 specific, actionable insights to improve future decision-making.`;
}
