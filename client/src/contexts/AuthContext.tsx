import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type User = {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    isActive?: boolean;
};

type AuthState = {
    user: User | null;
    loading: boolean;
    error: Error | null;
    isAuthenticated: boolean;
};

type AuthContextType = AuthState & {
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    refresh: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
        isAuthenticated: false,
    });

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setState(s => ({ ...s, user: null, isAuthenticated: false, loading: false }));
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const user = await res.json();
                setState({ user, isAuthenticated: true, loading: false, error: null });
            } else {
                localStorage.removeItem('token');
                setState({ user: null, isAuthenticated: false, loading: false, error: null });
            }
        } catch (err) {
            console.error(err);
            setState(s => ({ ...s, loading: false }));
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email: string, password: string) => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error?.message || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

            setState({ user: data.user, isAuthenticated: true, loading: false, error: null });
            return data;
        } catch (error) {
            setState(s => ({ ...s, loading: false, error: error as Error }));
            throw error;
        }
    };

    const logout = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (e) { console.error(e); }
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setState({ user: null, isAuthenticated: false, loading: false, error: null });
    }, []);

    const register = async (name: string, email: string, password: string) => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Registration failed');

            await login(email, password);
        } catch (error) {
            setState(s => ({ ...s, loading: false, error: error as Error }));
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={{ ...state, login, logout, register, refresh: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
    return context;
};
