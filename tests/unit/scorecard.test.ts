import { describe, it, expect, vi } from 'vitest';
import { calculateScore, getVerdict } from '../../backend/shared/scoring';

describe('Decision Scorecard Calculations', () => {
    it('should calculate total score correctly', () => {
        const scores = [1, 0, -1, 1];
        const total = calculateScore(scores);
        expect(total).toBe(1);
    });

    it('should return excellent verdict for score 4', () => {
        expect(getVerdict(4)).toBe('excellent');
    });

    it('should return critical verdict for score -4', () => {
        expect(getVerdict(-4)).toBe('critical');
    });

    it('should handle edge cases', () => {
        expect(getVerdict(3)).toBe('excellent');
        expect(getVerdict(2)).toBe('acceptable');
        expect(getVerdict(0)).toBe('borderline');
        expect(getVerdict(-1)).toBe('poor');
        expect(getVerdict(-3)).toBe('critical');
    });
});