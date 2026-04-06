import { app } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { v4 as uuidv4 } from 'uuid';

if (!process.env.COSMOS_DB_CONNECTION_STRING) {
    throw new Error('Missing COSMOS_DB_CONNECTION_STRING environment variable');
}

const cosmosClient = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const database = cosmosClient.database("decision-audit");
const container = database.container("scorecards");

async function createScorecard(request: any, context: any): Promise<any> {
    try {
        const scorecard: any = await request.json();

        // Validate scorecard
        if (!validateScorecard(scorecard)) {
            return {
                status: 400,
                jsonBody: { error: "Invalid scorecard data" }
            };
        }

        // Add metadata
        scorecard.id = uuidv4();
        scorecard.createdAt = new Date().toISOString();
        scorecard.userId = request.headers.get('x-user-id') || 'anonymous';

        // Calculate total score
        scorecard.totalScore = scorecard.scores.reduce(
            (sum: number, s: any) => sum + s.score,
            0
        );

        // Determine verdict
        scorecard.verdict = getVerdict(scorecard.totalScore);

        // Save to Cosmos DB
        const { resource } = await container.items.create(scorecard);

        context.log(`Created scorecard ${resource!.id}`);

        return {
            status: 201,
            jsonBody: resource
        };
    } catch (error) {
        context.log(`Error creating scorecard: ${error}`);
        return {
            status: 500,
            jsonBody: { error: "Internal server error" }
        };
    }
}

function validateScorecard(scorecard: any): boolean {
    return (
        scorecard &&
        scorecard.category &&
        scorecard.scores &&
        Array.isArray(scorecard.scores) &&
        scorecard.scores.length === 4
    );
}

function getVerdict(score: number): string {
    if (score >= 3) return 'excellent';
    if (score >= 1) return 'acceptable';
    if (score === 0) return 'borderline';
    if (score >= -2) return 'poor';
    return 'critical';
}

app.http('create-scorecard', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: createScorecard
});
