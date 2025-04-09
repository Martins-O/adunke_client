import axios from 'axios';

// Create axios instance with configurable baseURL
const baseURL = 'https://adunke-server.onrender.com/api'; // Changed to 5000
console.log('Axios baseURL:', baseURL);
if (!baseURL.startsWith('http')) {
    console.warn('Invalid VITE_API_URL, falling back to default:', baseURL);
}

const instance = axios.create({
    baseURL,
    timeout: 10000,
    // headers: {
    //     'Content-Type': 'application/json',
    // },
});

// Function to setup interceptors with navigate
export const setupInterceptors = (navigate) => {
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['x-auth-token'] = token;
            }
            return config;
        },
        (error) => {
            console.error('Request interceptor error:', {
                message: error.message,
                config: error.config,
                stack: error.stack,
            });
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login', { replace: true });
            }
            console.error('API call error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            return Promise.reject(error.response?.data || error);
        }
    );
};

export default instance;