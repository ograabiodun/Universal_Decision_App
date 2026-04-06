import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { v4 as uuidv4 } from 'uuid';

const cosmosClient = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const database = cosmosClient.database("decision-audit");
const container = database.container("scorecards");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const scorecard = req.body;
    
    // Validate scorecard
    if (!validateScorecard(scorecard)) {
      context.res = {
        status: 400,
        body: { error: "Invalid scorecard data" }
      };
      return;
    }

    // Add metadata
    scorecard.id = uuidv4();
    scorecard.createdAt = new Date().toISOString();
    scorecard.userId = req.headers['x-user-id'] || 'anonymous';

    // Calculate total score
    scorecard.totalScore = scorecard.scores.reduce(
      (sum: number, s: any) => sum + s.score, 
      0
    );
    
    // Determine verdict
    scorecard.verdict = getVerdict(scorecard.totalScore);

    // Save to Cosmos DB
    const { resource } = await container.items.create(scorecard);

    // Trigger AI insights (async)
    context.bindings.insightsQueue = {
      scorecardId: resource.id,
      scores: resource.scores
    };

    context.res = {
      status: 201,
      body: resource
    };
  } catch (error) {
    context.log.error("Error creating scorecard:", error);
    context.res = {
      status: 500,
      body: { error: "Internal server error" }
    };
  }
};

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

export default httpTrigger;