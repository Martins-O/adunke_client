import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProduct = useCallback(async () => {
        try {
            // Validate ID before making the API call
            if (!id || id === 'undefined') {
                console.log('Invalid ID detected:', id);
                setError('Invalid product ID');
                setLoading(false);
                return;
            }

            console.log('Fetching product with ID:', id);

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/products/${id}`,
                { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
            );

            console.log('API response:', response.status, response.data);

            if (response.status === 200) {
                setProduct(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load product details');
            console.error('Fetch error:', err.response?.status, err.response?.data);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        // Only fetch if we have a valid ID
        if (id && id !== 'undefined') {
            fetchProduct();
        } else {
            setError('Invalid product ID');
            setLoading(false);
        }
    }, [id, fetchProduct]);

    const handleWhatsApp = useCallback(() => {
        if (!product) return;

        const message = `Hi! I want to buy:\n*${product.name}*\nPrice: ₦${product.price.toFixed(2)}\nPicture: ${product.image}\nDescription: ${product.description}`;
        const phoneNumber = '2349137144123';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, [product]);

    console.log('Current state:', { loading, error, product, id });

    if (loading) {
        return <div className="product-detail loading"><div className="spinner">Loading...</div></div>;
    }

    if (error) {
        const isLoggedIn = !!localStorage.getItem('token'); // Check if token exists
        const backTo = isLoggedIn ? '/admin' : '/'; // Conditional navigation
        const backLabel = isLoggedIn ? 'Back to Dashboard' : 'Back to Products';

        return (
            <div className="product-detail error">
                <div className="error-message">{error}</div>
                <button
                    onClick={() => id && id !== 'undefined' ? fetchProduct() : null}
                    className="btn btn-retry"
                    aria-label="Retry loading product"
                >
                    Try Again
                </button>
                <button
                    onClick={() => navigate(backTo)}
                    className="btn btn-back"
                    aria-label={`Back to ${backLabel}`}
                >
                    {backLabel}
                </button>
            </div>
        );
    }

    return (
        <div className="product-detail">
            <div className="product-image">
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => { e.target.src = '/fallback-image.jpg'; }}
                />
            </div>
            <div className="product-info">
                <h1>{product.name}</h1>
                <p className="price">Price: ₦{product.price.toFixed(2)}</p>
                <p className="description">Description: {product.description}</p>
                <p className="stock">Stock: {product.stock}</p>
                <p className="category">Category: {product.category}</p>
                <button
                    onClick={handleWhatsApp}
                    className="btn btn-success whatsapp-btn"
                    aria-label="Buy via WhatsApp"
                >
                    <span className="whatsapp-icon">📱</span> Buy via WhatsApp
                </button>
            </div>
        </div>
    );
};

export default ProductDetail;