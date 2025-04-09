import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductListing = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        size: [],
        availability: [],
        category: [],
        colors: [],
        priceRange: { min: 0, max: 1000 },
        collections: [],
        tags: [],
        ratings: [],
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
                setProducts(response.data.products || []);
            } catch (err) {
                setError('Failed to load products');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleFilterChange = (filterType, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterType]: value,
        }));
    };

    const handleViewDetails = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <div className="product-listing">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <span>Home</span> / <span>Products</span>
            </div>

            {/* Page Title */}
            <h1>PRODUCTS</h1>

            <div className="product-layout">
                {/* Filters Sidebar */}
                <aside className="filters-sidebar">
                    <h2>Filters</h2>

                    {/* Size Filter */}
                    <div className="filter-section">
                        <h3>Size</h3>
                        <div className="filter-options">
                            {['XS', 'S', 'M', 'L', 'XL', 'ZX'].map((size) => (
                                <label key={size}>
                                    <input
                                        type="checkbox"
                                        checked={filters.size.includes(size)}
                                        onChange={() => handleFilterChange('size', size)}
                                    />
                                    {size}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Availability Filter */}
                    <div className="filter-section">
                        <h3>Availability</h3>
                        <div className="filter-options">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filters.availability.includes('in-stock')}
                                    onChange={() => handleFilterChange('availability', 'in-stock')}
                                />
                                In Stock
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filters.availability.includes('out-of-stock')}
                                    onChange={() => handleFilterChange('availability', 'out-of-stock')}
                                />
                                Out of Stock
                            </label>
                        </div>
                    </div>

                    {/* Add more filters (Category, Colors, Price Range, etc.) */}
                </aside>

                {/* Product Grid */}
                <main className="product-grid">
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        products.map((product) => (
                            <div key={product._id} className="product-card">
                                <img src={product.image} alt={product.name} />
                                <h3>{product.name}</h3>
                                <p>${product.price.toFixed(2)}</p>
                                <button onClick={() => handleViewDetails(product._id)}>View Details</button>
                            </div>
                        ))
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductListing;