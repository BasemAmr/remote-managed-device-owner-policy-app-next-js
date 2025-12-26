import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const auth = {
    // Store token in cookie (7 days expiry)
    setToken: (token: string): void => {
        Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'strict' });
    },

    // Get token from cookie
    getToken: (): string | undefined => {
        return Cookies.get(TOKEN_KEY);
    },

    // Remove token from cookie
    removeToken: (): void => {
        Cookies.remove(TOKEN_KEY);
    },

    // Store user data in localStorage
    setUser: (user: { id: number; email: string; created_at: string }): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    },

    // Get user data from localStorage
    getUser: (): { id: number; email: string; created_at: string } | null => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        }
        return null;
    },

    // Remove user data from localStorage
    removeUser: (): void => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_KEY);
        }
    },

    // Clear all auth data
    clearAuth: (): void => {
        auth.removeToken();
        auth.removeUser();
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return !!auth.getToken();
    },
};
