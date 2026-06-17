import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe, mockLogin as apiMockLogin } from '../api/authApi';

const AuthContext = createContext();

export const ROLES = {
    OWNER: 'OWNER',
    MANAGER: 'MANAGER',
    WORKER: 'WORKER',
    EMPLOYEE: 'EMPLOYEE',
    ADMIN: 'ADMIN',
    CLIENT: 'CLIENT'
};

const MOCK_USERS = [
    { id: 1, name: 'Platform Owner', role: ROLES.ADMIN, avatar: 'A' },
    { id: 2, name: 'Customer Support', role: ROLES.EMPLOYEE, avatar: 'E' },
    { id: 3, name: 'Sales Manager', role: ROLES.MANAGER, avatar: 'M' },
    { id: 4, name: 'Test Client', role: ROLES.CLIENT, avatar: 'C' },
];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            const mockUser = localStorage.getItem('warchati_user');

            if (token) {
                try {
                    const userData = await getMe();
                    setUser(userData);
                    setLoading(false);
                    return;
                } catch {
                    localStorage.removeItem('access_token');
                }
            }

            if (mockUser) {
                const parsed = JSON.parse(mockUser);
                try {
                    const data = await apiMockLogin(parsed.id);
                    localStorage.setItem('access_token', data.token);
                    localStorage.removeItem('warchati_user');
                    setUser(data.user);
                } catch {
                    setUser(parsed);
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        if (email && password) {
            const data = await apiLogin(email, password);
            localStorage.setItem('access_token', data.token);
            setUser(data.user);
            return data.user;
        }
        return null;
    }, []);

    const mockLogin = useCallback(async (userId) => {
        try {
            const data = await apiMockLogin(userId);
            localStorage.setItem('access_token', data.token);
            localStorage.removeItem('warchati_user');
            setUser(data.user);
            return data.user;
        } catch (err) {
            console.error('[Auth] Mock login failed, falling back to local mock:', err.message);
            const foundUser = MOCK_USERS.find(u => u.id === userId);
            if (foundUser) {
                setUser(foundUser);
                localStorage.setItem('warchati_user', JSON.stringify(foundUser));
                return foundUser;
            }
            return null;
        }
    }, []);

    const register = useCallback(async (formData) => {
        const data = await apiRegister(formData);
        localStorage.setItem('access_token', data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('warchati_user');
    }, []);

    const value = {
        user,
        login,      // JWT login (email, password)
        register,   // JWT register (formData)
        mockLogin,  // Mock login (userId)
        logout,
        isLoading: loading,
        MOCK_USERS,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
