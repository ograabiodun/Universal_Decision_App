import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDatabase(): Promise<Db> {
    if (cachedDb) {
        return cachedDb;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Missing MONGODB_URI environment variable');
    }

    const client = new MongoClient(uri);
    await client.connect();

    cachedClient = client;
    cachedDb = client.db('DecisionHelper0');

    return cachedDb;
}
