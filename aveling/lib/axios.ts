import axios from 'axios';

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
    // In a real app, you'd pull the token from storage or context.
    const token = typeof window !== 'undefined' ? localStorage.getItem('lms_token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
