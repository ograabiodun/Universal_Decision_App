import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './lib/mongodb';
import { getUser } from './lib/auth';
import { generateServerInsights } from './lib/scoring';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { scorecardId, scores, category, title, emotionBefore, isPreDecision } = req.body;

        if (!scorecardId || !scores) {
            return res.status(400).json({ error: 'Missing scorecardId or scores' });
        }

        const user = await getUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const openaiKey = process.env.OPENAI_API_KEY;

        let insights: string;

        if (openaiKey) {
            const openaiClient = new OpenAI({ apiKey: openaiKey });
            const prompt = generateInsightPrompt(scores, category, title, emotionBefore, isPreDecision);
            const response = await openaiClient.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 400,
                temperature: 0.7
            });
            insights = response.choices[0].message.content || '';
        } else {
            const ruleInsights = generateServerInsights(scores, category, emotionBefore, isPreDecision);
            insights = ruleInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n\n');
        }

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

function generateInsightPrompt(
    scores: any[],
    category?: string,
    title?: string,
    emotionBefore?: { emotions: string[]; intensity: number },
    isPreDecision?: boolean
): string {
    const scoreSummary = scores.map((s: any) => {
        const level = s.level || (s.score === 1 ? 'good' : s.score === 0 ? 'partial' : 'none');
        const levelLabel = level === 'good' ? 'Good ✅' : level === 'partial' ? 'Partial ⚠️' : 'None ❌';
        return `${s.pillarName}: ${levelLabel}`;
    }).join('\n');

    const totalScore = scores.reduce((sum: number, s: any) => sum + (s.score || 0), 0);

    let context = '';
    if (title) context += `Decision: "${title}"\n`;
    if (category) context += `Category: ${category}\n`;
    if (isPreDecision !== undefined) context += `Type: ${isPreDecision ? 'Pre-decision (planning stage)' : 'Post-decision (reviewing what happened)'}\n`;
    if (emotionBefore && emotionBefore.emotions.length > 0) {
        context += `Emotional state: ${emotionBefore.emotions.join(', ')} at intensity ${emotionBefore.intensity}/10\n`;
    }

    return `You are a decision-making coach analyzing a user's decision audit. Here is their context and scores:

${context}
Pillar Scores (Good = +1, Partial = 0, None = -1):
${scoreSummary}

Total Score: ${totalScore} (range: -4 to +4)

Provide exactly 3 specific, actionable insights:
1. Address the biggest risk based on their weak pillars and the specific decision category
2. Connect their emotional state to their pillar scores — highlight any red flags or positive patterns
3. Give one concrete next step they can take in the next 24 hours to improve their decision quality

Be encouraging but honest. Be specific to their decision category ("${category || 'general'}") — generic advice is useless. Each insight should be 2-3 sentences. Format as a numbered list.`;
}
