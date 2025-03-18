import axios from 'axios';

// Create axios instance with configurable baseURL
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000, // Added timeout for better error handling
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
            // Alternative header format (uncomment if preferred):
            // config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request errors
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common error cases
        if (error.response?.status === 401) {
            // Token might be invalid/expired
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        console.error('API call error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error);
    }
);

export default instance;