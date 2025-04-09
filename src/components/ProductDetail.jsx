import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const fetchProduct = useCallback(async () => {
        try {
            if (!id || id === 'undefined') {
                console.log('Invalid ID detected:', id);
                setError('Invalid product ID');
                setLoading(false);
                return;
            }

            console.log('Fetching product with ID:', id);

            const response = await axios.get(`/products/${id}`);
            
            if (!response.data) {
                throw new Error('No data received from server');
            }

            console.log('API response:', response.status, response.data);

            if (response.status === 200) {
                setProduct(response.data);
            }
        } catch (err) {
            setError(
                err.code === 'ECONNABORTED'
                    ? 'Request timed out. Please try again.'
                    : err.response
                        ? err.response.data?.message || 'Failed to load product details'
                        : 'Network error. Please check your connection.'
            );
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id && id !== 'undefined') {
            fetchProduct();
        } else {
            setError('Invalid product ID');
            setLoading(false);
        }
    }, [id, fetchProduct]);

    const handleWhatsApp = useCallback(() => {
        if (!product) return;

        const formattedPrice = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(product.price || 0);

        const message = `Hello! I'm interested in purchasing:\n\n` +
            `*Product*: ${product.name || 'Unknown Product'}\n` +
            `*Price*: ${formattedPrice}\n` +
            `*Image*: ${product.images?.[0] || product.image || 'N/A'}\n` +
            `*Description*: ${product.description?.trim() || 'No description'}\n\n` +
            `Please let me know about availability and payment options!`;
        const phoneNumber = '2349137144123';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, [product]);

    const handleBackClick = () => {
        navigate('/admin/dashboard'); // Back to admin dashboard
    };

    console.log('Current state:', { loading, error, product, id });

    if (loading) {
        return <div className="product-detail loading"><div className="spinner">Loading...</div></div>;
    }

    if (error) {
        const isLoggedIn = !!localStorage.getItem('token');
        const backTo = isLoggedIn ? '/admin' : '/';
        const backLabel = isLoggedIn ? 'Back to Dashboard' : 'Back to Products';

        return (
            <div className="product-detail error">
                <div className="error-message">{error}</div>
                <button onClick={fetchProduct} className="btn btn-retry" aria-label="Retry loading product">
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
        <div className="product-detail-container">
            {/* Back button */}
            <button
                onClick={handleBackClick}
                className="back-button"
                style={{
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                ← Back to Admin
            </button>

            <div className="product-detail">
                <div className="product-image-container">
                    <img
                        src={product.images?.[activeImageIndex] || product.image || '/fallback-image.jpg'}
                        alt={product.name || 'Product Image'}
                        loading="lazy"
                        className="main-product-image"
                        onError={(e) => {
                            console.warn(`Failed to load image: ${e.target.src}`);
                            e.target.src = '/fallback-image.jpg';
                        }}
                    />

                    {/* Thumbnail images gallery if multiple images exist */}
                    {product.images && product.images.length > 1 && (
                        <div className="image-thumbnails">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`thumbnail-btn ${activeImageIndex === index ? 'active' : ''}`}
                                    onClick={() => setActiveImageIndex(index)}
                                    onKeyDown={(e) => {
                                        if (e.key === ' ') {
                                            e.preventDefault();
                                        }
                                    }}
                                    aria-label={`View ${product.name} image ${index + 1}`}
                                >
                                    <img
                                        src={img}
                                        alt=""
                                        className="thumbnail"
                                        onError={(e) => { e.target.src = '/fallback-image.jpg'; }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-info">
                    <h1>{product.name}</h1>
                    <p className="price">Price: ₦{product.price.toFixed(2)}</p>
                    {product.discountPercent > 0 && (
                        <p className="discount">
                            Discount: {product.discountPercent}% off
                            <span className="original-price">Original: ₦{product.price.toFixed(2)}</span>
                            <span className="discounted-price">Now: ₦{(product.price * (1 - product.discountPercent / 100)).toFixed(2)}</span>
                        </p>
                    )}
                    <p className="description">Description: {product.description}</p>
                    <p className="stock">Stock: {product.stock}</p>
                    <p className="category">Category: {product.category}</p>

                    {product.sizes && product.sizes.length > 0 && (
                        <div className="sizes">
                            <p>Available Sizes: {product.sizes.join(', ')}</p>
                        </div>
                    )}

                    {product.colors && product.colors.length > 0 && (
                        <div className="colors">
                            <p>Available Colors: {product.colors.join(', ')}</p>
                        </div>
                    )}

                    <button
                        onClick={handleWhatsApp}
                        className="btn btn-success whatsapp-btn"
                        aria-label="Buy via WhatsApp"
                    >
                        <span className="whatsapp-icon">📱</span> Buy via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;