'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { authApi, getErrorMessage } from '@/lib/api';
import type { Admin } from '@/lib/types';

interface AuthContextType {
    user: Admin | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    verifyAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Admin | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Verify authentication on mount
    const verifyAuth = useCallback(async (): Promise<boolean> => {
        const storedToken = auth.getToken();
        const storedUser = auth.getUser();

        if (!storedToken) {
            setIsLoading(false);
            return false;
        }

        try {
            // Verify token with backend
            const response = await authApi.verify();

            if (response.valid && response.admin) {
                setToken(storedToken);
                setUser(response.admin);
                auth.setUser(response.admin);
                setIsLoading(false);
                return true;
            } else {
                // Token invalid, clear auth
                auth.clearAuth();
                setToken(null);
                setUser(null);
                setIsLoading(false);
                return false;
            }
        } catch (error) {
            console.error('Auth verification failed:', getErrorMessage(error));
            // On error, clear auth
            auth.clearAuth();
            setToken(null);
            setUser(null);
            setIsLoading(false);
            return false;
        }
    }, []);

    // Login function
    const login = useCallback(async (email: string, password: string): Promise<void> => {
        try {
            const response = await authApi.login(email, password);

            // Store token and user
            auth.setToken(response.token);
            auth.setUser(response.admin);

            setToken(response.token);
            setUser(response.admin);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }, [router]);

    // Logout function
    const logout = useCallback(() => {
        auth.clearAuth();
        setToken(null);
        setUser(null);
        router.push('/login');
    }, [router]);

    // Verify auth on mount
    useEffect(() => {
        verifyAuth();
    }, [verifyAuth]);

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        verifyAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
