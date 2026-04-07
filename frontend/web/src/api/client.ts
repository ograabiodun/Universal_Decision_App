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
    login: (email: string) =>
        request<{ userId: string; email: string; token: string }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email })
        }),

    createScorecard: (data: any) =>
        request<any>('/api/create-scorecard', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    getScorecards: () =>
        request<any[]>('/api/get-scorecards'),

    getScorecard: (id: string) =>
        request<any>(`/api/get-scorecard?id=${id}`),

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
