import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../utils/api';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkAuth();
        }
    }, []);

    const checkAuth = async () => {
        try {
            const response = await auth.me();
            if (response.data) {
                setUser(response.data);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        }
    };

    const login = async (username: string, password: string) => {
        const response = await auth.login({ username, password });
        if (response.data) {
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            setIsAuthenticated(true);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        const response = await auth.register({ username, email, password });
        if (response.data) {
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            setIsAuthenticated(true);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
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