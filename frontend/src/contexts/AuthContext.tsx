
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe } from '@/lib/api';

interface User {
    id: number;
    email: string;
    full_name?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await getMe();
            if (userData) {
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            // Keep user null if error
            console.error("Auth check failed:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (token: string) => {
        localStorage.setItem('access_token', token);
        // Also set 'token' for backward compatibility if needed, based on Login.tsx
        localStorage.setItem('token', token);
        await checkAuth();
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
