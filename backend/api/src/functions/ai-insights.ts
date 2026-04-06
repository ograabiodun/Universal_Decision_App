import { app } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { AzureOpenAI } from "openai";

if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_KEY) {
    throw new Error('Missing AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_KEY environment variables');
}

if (!process.env.COSMOS_DB_CONNECTION_STRING) {
    throw new Error('Missing COSMOS_DB_CONNECTION_STRING environment variable');
}

const openAIClient = new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_KEY,
    apiVersion: "2024-02-01"
});

const cosmosClient = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);

async function aiInsights(queueItem: any, context: any): Promise<void> {
    try {
        const { scorecardId, scores } = queueItem;

        // Generate AI insights based on scores
        const prompt = generateInsightPrompt(scores);

        const response = await openAIClient.chat.completions.create({
            model: "decision-insights",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200,
            temperature: 0.7
        });

        const insights = response.choices[0].message.content;

        // Store insights in Cosmos DB
        const container = cosmosClient
            .database("decision-audit")
            .container("scorecards");

        // The container partition key is /userId; read the scorecard to get its partition key value
        const { resource: existing } = await container.item(scorecardId).read();
        const partitionKeyValue = existing?.userId || 'anonymous';

        await container.item(scorecardId, partitionKeyValue).patch([
            { op: "add", path: "/aiInsights", value: insights }
        ]);

        context.log(`Generated insights for scorecard ${scorecardId}`);
    } catch (error) {
        context.error("Error generating insights:", error);
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

app.storageQueue('ai-insights', {
    queueName: 'insights-queue',
    connection: 'AzureWebJobsStorage',
    handler: aiInsights
});
