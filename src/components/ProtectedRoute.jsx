import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from '../utils/axiosConfig'; // Use consistent axios instance

// Utility function to validate JWT token
const validateToken = async (token) => {
    if (!token) return false;

    try {
        const response = await axios.get('/auth/verify', {
            headers: {
                'x-auth-token': token, // Match backend expectation
            },
            timeout: 3000,
        });
        return response.status === 200;
    } catch (error) {
        console.error('Token validation failed:', error.response?.data || error.message);
        return false;
    }
};

const ProtectedRoute = ({ children, redirectPath = '/login' }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);

            if (!token) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            const isValid = await validateToken(token);
            if (!isValid) {
                localStorage.removeItem('token'); // Clean up invalid token
            }
            setIsAuthenticated(isValid);
            setIsLoading(false);
        };

        checkAuth();
    }, [token]); // Dependency on token ensures re-check if it changes

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner">Verifying authentication...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={redirectPath}
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    redirectPath: PropTypes.string,
};

export default ProtectedRoute;