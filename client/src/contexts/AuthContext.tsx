'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { CONSTANTS } from '@/constants';

interface User {
    id: number;
    email: string;
    role: string;
    fullName: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (accessToken: string, user: User) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = [
    CONSTANTS.ROUTES.HOME,
    CONSTANTS.ROUTES.PUBLIC_JOBS,
    CONSTANTS.ROUTES.ABOUT,
    CONSTANTS.ROUTES.TERMS,
    CONSTANTS.ROUTES.PRIVACY,
    CONSTANTS.ROUTES.COMPLIANCE,
    CONSTANTS.ROUTES.SUPPORT,
    '/verify-email',
];

const AUTH_ROUTES = [
    CONSTANTS.ROUTES.LOGIN,
    CONSTANTS.ROUTES.REGISTER,
    CONSTANTS.ROUTES.FORGOT_PASSWORD,
    CONSTANTS.ROUTES.RESET_PASSWORD,
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const refreshUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error: any) {
            // Only clear session if it's an explicit authentication error (401/403)
            // Transient errors (like network timeouts or 500s) should not trigger a logout
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.warn('[AuthContext] Explicit auth error detected. Clearing session.');
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
            } else {
                console.warn('[AuthContext] Transient refresh error. Session preserved.', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (token) {
            refreshUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)));
            const isAuthRoute = AUTH_ROUTES.some(route => pathname === route || pathname.startsWith('/register/'));
            const isAdminRoute = pathname.startsWith('/admin');
            const isDashboardRoute = pathname.startsWith('/dashboard');

            if (!user) {
                // Not logged in: Redirect if accessing restricted routes
                if (!isPublicRoute && (isAdminRoute || isDashboardRoute)) {
                    router.push(CONSTANTS.ROUTES.LOGIN);
                }
            } else {
                // Logged in: Handle cross-role protection
                // Removed auto-redirect from isAuthRoute to allow user control on Login page
                if (user.role === CONSTANTS.ROLES.APPLICANT && isAdminRoute) {
                    router.push(CONSTANTS.ROUTES.DASHBOARD);
                } else if (user.role === CONSTANTS.ROLES.ADMIN && isDashboardRoute) {
                    router.push(CONSTANTS.ROUTES.ADMIN.DASHBOARD);
                }
            }
        }
    }, [user, isLoading, pathname, router]);

    const login = (accessToken: string, user: User) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
            router.push(CONSTANTS.ROUTES.LOGIN);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
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
