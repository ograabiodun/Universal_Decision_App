import { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../types';
import { api } from '../api/client';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('auth_user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string, mode: 'login' | 'register' = 'login') => {
        const data = await api.login(email, password, mode);
        const authUser: AuthUser = {
            userId: data.userId,
            email: data.email,
            token: data.token
        };
        localStorage.setItem('auth_user', JSON.stringify(authUser));
        localStorage.setItem('auth_token', data.token);
        setUser(authUser);
        return authUser;
    }, []);

    const loginAsGuest = useCallback(() => {
        const guest: AuthUser = { userId: 'guest', email: '', token: '' };
        setUser(guest);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        setUser(null);
    }, []);

    return {
        user,
        loading,
        login,
        loginAsGuest,
        logout,
        isGuest: user?.userId === 'guest'
    };
}
