import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import socketManager from '../lib/socketManager';

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isLoggingIn: false,
    isSigningUp: false,
    isCheckingAuth: true,
    isUpdatingProfile: false,
    isLoading: false,
    tempEmail: null, // For storing email during signup process

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check-auth');
            set({ authUser: res.data });
            
            // Initialize socket connection if user is authenticated
            if (res.data) {
                socketManager.connect();
            }
        } catch (error) {
            console.log('Error checking auth:', error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (userData) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', userData);
            set({ authUser: res.data, tempEmail: userData.email }); // Store email for verification
            toast.success('Signup successful!');
        } catch (error) {
            console.log('Error during signup:', error);
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (userData) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', userData);
            set({ authUser: res.data });
            toast.success('Login successful!');
            
            // Initialize socket connection
            socketManager.connect();
        } catch (error) {
            console.log('Error during login:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success('Logout successful!');
            
            // Disconnect socket
            socketManager.disconnect();
        } catch (error) {
            console.log('Error during logout:', error);
            toast.error(error.response?.data?.message || 'Logout failed');
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post('/auth/verify-email', { code });
            set({ authUser: res.data, isLoading: false });
            toast.success('Email verified successfully!');
            return res.data;
        } catch (error) {
            console.log('Error verifying email:', error);
            toast.error(error.response?.data?.message || 'Email verification failed');
            set({ isLoading: false });
            throw error;
        }
    },  

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: res.data });
            toast.success('Profile updated successfully!');
            return res.data;
        } catch (error) {
            console.log('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Profile update failed');
            throw error;
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    
}))