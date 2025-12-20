import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const checkAuth = async () => {
            try {
                const response = await axios.get('/api/auth/me');
                if (response.data.authenticated) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const loginWithPassword = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            if (response.data.user) {
                setUser(response.data.user);
                return { success: true };
            }
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed. Please check your credentials.'
            };
        }
    };

    const register = async (email, password, name) => {
        try {
            const response = await axios.post('/api/auth/register', { email, password, name });
            if (response.data.user) {
                setUser(response.data.user);
                return { success: true };
            }
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed. Please try again.'
            };
        }
    };

    const updateProfile = async (name) => {
        try {
            const response = await axios.put('/api/auth/update', { name });
            if (response.data.user) {
                setUser(response.data.user);
                return { success: true, message: response.data.message };
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update profile.'
            };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await axios.post('/api/auth/change-password', { currentPassword, newPassword });
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to change password.'
            };
        }
    };

    const logout = async () => {
        try {
            await axios.get('/api/auth/logout');
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithPassword,
            register,
            logout,
            updateProfile,
            changePassword
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
