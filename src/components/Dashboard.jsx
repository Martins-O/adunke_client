import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const initializeDashboard = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in.');
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                await axios.get('/auth/verify', { headers: { 'x-auth-token': token } });
                const productResponse = await axios.get('/products', {
                    headers: { 'x-auth-token': token },
                });
                console.log('Full product response data structure:', JSON.stringify(productResponse.data, null, 2));

                const productArray = productResponse.data.products || [];
                setProducts(productArray);
                setStats({
                    totalProducts: productResponse.data.pagination?.totalItems || productArray.length,
                    lowStock: productArray.filter(p => p.stock < 5).length,
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard');
                console.error('Dashboard initialization error:', err);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        initializeDashboard();
    }, [navigate]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        setLoading(true);
        try {
            await axios.delete(`/products/admin/${productId}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') },
            });
            const updatedProducts = products.filter(p => p._id !== productId);
            setProducts(updatedProducts);
            setStats({
                totalProducts: updatedProducts.length,
                lowStock: updatedProducts.filter(p => p.stock < 5).length,
            });
            setSuccess('Product deleted successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete product');
            console.error('Error deleting product:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (productId) => {
        if (!productId) {
            console.error('WARNING: Attempted to navigate with undefined/null product ID');
            return;
        }
        console.log(`Navigating to: /product/${productId}`);
        navigate(`/product/${productId}`);
    };

    const handleUpdate = (productId) => {
        navigate(`/admin/update/${productId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const renderProductTable = () => {
        if (!Array.isArray(products)) {
            return <p>Error: Products data is invalid.</p>;
        }

        if (products.length === 0) {
            return <p>No products available.</p>;
        }

        return (
            <div className="product-table">
                <table>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product) => (
                        <tr key={product._id}>
                            <td>{product.name}</td>
                            <td>₦{product.price.toFixed(2)}</td>
                            <td>{product.stock}</td>
                            <td>{product.category}</td>
                            <td>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleViewDetails(product._id)}
                                    disabled={loading}
                                    style={{ marginRight: '0.5rem' }}
                                >
                                    Details
                                </button>
                                <button
                                    className="btn btn-warning"
                                    onClick={() => handleUpdate(product._id)}
                                    disabled={loading}
                                    style={{ marginRight: '0.5rem' }}
                                >
                                    Update
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(product._id)}
                                    disabled={loading}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="mobile-menu">
                    <button onClick={toggleMenu} className="hamburger-btn">
                        ☰
                    </button>
                    <h1>Admin Dashboard</h1>
                </div>
                {isMenuOpen && (
                    <div className="mobile-nav">
                        <button onClick={() => navigate('/admin/add')}>Add Product</button>
                        <button onClick={() => navigate('/admin/bulk-add')}>Bulk Add Products</button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
                <div>
                    <button className="btn btn-primary" onClick={() => navigate('/admin/add')} disabled={loading}>
                        Add Product
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/admin/bulk-add')}
                        disabled={loading}
                        style={{ marginLeft: '1rem' }}
                    >
                        Bulk Add Products
                    </button>
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                        disabled={loading}
                        style={{ marginLeft: '1rem' }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <>
                    <section className="dashboard-stats">
                        <div className="stat-card">
                            <h3>Total Products</h3>
                            <p>{stats.totalProducts}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Low Stock (&lt;5)</h3>
                            <p>{stats.lowStock}</p>
                        </div>
                    </section>

                    <section className="dashboard-products">
                        <h2>Product Overview</h2>
                        {renderProductTable()}
                    </section>
                </>
            )}
        </div>
    );
};

export default Dashboard;