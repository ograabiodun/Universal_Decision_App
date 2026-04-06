import { AzureFunction, Context } from "@azure/functions";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const openAIClient = new OpenAIClient(
    process.env.AZURE_OPENAI_ENDPOINT!,
    new AzureKeyCredential(process.env.AZURE_OPENAI_KEY!)
);

const queueTrigger: AzureFunction = async function (
    context: Context,
    queueItem: any
): Promise<void> {
    try {
        const { scorecardId, scores } = queueItem;

        // Generate AI insights based on scores
        const prompt = generateInsightPrompt(scores);

        const response = await openAIClient.getCompletions(
            "decision-insights",
            prompt,
            {
                maxTokens: 200,
                temperature: 0.7
            }
        );

        const insights = response.choices[0].text;

        // Store insights in Cosmos DB
        const cosmosClient = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
        const container = cosmosClient
            .database("decision-audit")
            .container("scorecards");

        await container.item(scorecardId, scorecardId).patch([
            { op: "add", path: "/aiInsights", value: insights }
        ]);

        context.log(`Generated insights for scorecard ${scorecardId}`);
    } catch (error) {
        context.log.error("Error generating insights:", error);
    }
};

function generateInsightPrompt(scores: any[]): string {
    const scoreSummary = scores.map(s =>
        `${s.pillarName}: ${s.score === 1 ? 'Good' : s.score === 0 ? 'Bad' : 'Ugly'}`
    ).join('\n');

    return `Based on these decision scores:
${scoreSummary}

Provide 3 specific, actionable insights to improve future decision-making.`;
}

export default queueTrigger;