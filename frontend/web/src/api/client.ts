import { Scorecard, ScorecardFilters, PaginatedResponse } from '../types';

const getToken = (): string | null => localStorage.getItem('auth_token');

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>)
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${response.status})`);
    }

    return response.json();
}

export const api = {
    login: (email: string, password: string, mode: 'login' | 'register' = 'login') =>
        request<{ userId: string; email: string; token: string }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, mode })
        }),

    createScorecard: (data: any) =>
        request<any>('/api/create-scorecard', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    getScorecards: (filters?: ScorecardFilters) => {
        const params = new URLSearchParams();
        if (filters?.category) params.set('category', filters.category);
        if (filters?.search) params.set('search', filters.search);
        if (filters?.verdict) params.set('verdict', filters.verdict);
        if (filters?.mode) params.set('mode', filters.mode);
        if (filters?.page) params.set('page', String(filters.page));
        if (filters?.limit) params.set('limit', String(filters.limit));
        const qs = params.toString();
        return request<PaginatedResponse<Scorecard>>(`/api/get-scorecards${qs ? `?${qs}` : ''}`);
    },

    getScorecard: (id: string) =>
        request<any>(`/api/get-scorecard?id=${id}`),

    updateScorecard: (id: string, data: any) =>
        request<Scorecard>(`/api/update-scorecard?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    updateOutcome: (id: string, data: { result: string; notes: string }) =>
        request<Scorecard>(`/api/update-outcome?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    deleteScorecard: (id: string) =>
        request<any>(`/api/delete-scorecard?id=${id}`, { method: 'DELETE' }),

    getAiInsights: (scorecardId: string, scorecard: any) =>
        request<any>('/api/ai-insights', {
            method: 'POST',
            body: JSON.stringify({
                scorecardId,
                scores: scorecard.scores,
                category: scorecard.category,
                title: scorecard.title,
                emotionBefore: scorecard.emotionBefore,
                isPreDecision: scorecard.isPreDecision
            })
        })
};
