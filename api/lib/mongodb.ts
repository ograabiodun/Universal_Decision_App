import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDatabase(): Promise<Db> {
    if (cachedDb && cachedClient) {
        try {
            await cachedClient.db('admin').command({ ping: 1 });
            return cachedDb;
        } catch {
            cachedClient = null;
            cachedDb = null;
        }
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Missing MONGODB_URI environment variable');
    }

    const client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
    });
    await client.connect();

    cachedClient = client;
    cachedDb = client.db('DecisionHelper0');

    await Promise.all([
        cachedDb.collection('scorecards').createIndex({ userId: 1, createdAt: -1 }),
        cachedDb.collection('scorecards').createIndex({ id: 1 }, { unique: true }),
        cachedDb.collection('users').createIndex({ email: 1 }, { unique: true }),
        cachedDb.collection('users').createIndex({ token: 1 })
    ]).catch(() => {});

    return cachedDb;
}
