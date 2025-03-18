import React, { useState } from 'react';
import axios from '../utils/axiosConfig'; // Use consistent axios instance
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        if (!formData.username.trim()) return 'Username is required';
        if (!formData.password) return 'Password is required';
        if (formData.password.length < 6) return 'Password must be at least 6 characters';
        return null;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/auth/login', {
                username: formData.username,
                password: formData.password,
            }, { timeout: 5000 });

            if (response.status === 200) {
                const token = response.data.token;
                localStorage.setItem('token', token);
                console.log('Stored token:', token); // Debug log
                setSuccess('Login successful! Redirecting to Admin Panel...');
                setTimeout(() => navigate('/admin', { replace: true }), 1000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Admin Login</h2>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            aria-label="Username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            aria-label="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="toggle-password"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <div className="form-group">
                        <button type="submit" disabled={loading} aria-label="Login">
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                    <p className="routing-info">
                        Upon successful login, you’ll be redirected to the <strong>Admin Panel</strong>.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;