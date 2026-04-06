import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../backend/api/server';

describe('Scorecard API Integration', () => {
    let server: any;

    beforeAll(async () => {
        server = await createServer();
    });

    afterAll(async () => {
        await server.close();
    });

    it('should create a new scorecard', async () => {
        const response = await server.inject({
            method: 'POST',
            url: '/api/create-scorecard',
            payload: {
                category: 'career',
                title: 'Job Change Decision',
                scores: [
                    { pillarName: 'Planning', score: 1, notes: 'Had 6 months savings' },
                    { pillarName: 'Research', score: 0, notes: 'Some research done' },
                    { pillarName: 'Timing', score: 1, notes: 'Good timing' },
                    { pillarName: 'Emotional Control', score: -1, notes: 'A bit anxious' }
                ],
                isPreDecision: false
            }
        });

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.payload)).toHaveProperty('id');
    });

    it('should validate scorecard data', async () => {
        const response = await server.inject({
            method: 'POST',
            url: '/api/create-scorecard',
            payload: {
                category: 'career'
                // Missing required fields
            }
        });

        expect(response.statusCode).toBe(400);
    });
});