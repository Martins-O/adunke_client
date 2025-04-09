import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from '../utils/axiosConfig'; // Use configured instance
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        inStock: false,
    });
    const [sort, setSort] = useState('newest');
    const [inputValue, setInputValue] = useState(''); // Separate input state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 10;

    const debouncedSearch = useMemo(
        () => debounce((query) => {
            setSearchQuery(query);
            setCurrentPage(1);
        }, 300),
        []
    );

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('/products', {
                params: {
                    category: filters.category,
                    minPrice: filters.minPrice,
                    maxPrice: filters.maxPrice,
                    inStock: filters.inStock,
                    sort,
                    search: searchQuery,
                    page: currentPage,
                    limit: productsPerPage,
                },
            });
            console.log('API response:', response.data);

            if (response.status === 200) {
                setProducts(response.data.products || response.data); // Adjust based on backend response
                setTotalProducts(response.data.total || response.data.length);
            }
        } catch (err) {
            setError(
                err.code === 'ECONNABORTED'
                    ? 'Request timed out. Please try again.'
                    : err.response
                        ? err.response.data?.message || 'Failed to load products'
                        : 'Network error. Please check your connection.'
            );
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, sort, searchQuery, currentPage]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        setInputValue(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const resetFilters = () => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
        });
        setSort('newest');
        setInputValue('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const totalPages = useMemo(() => Math.ceil(totalProducts / productsPerPage), [totalProducts]);

    if (loading) {
        return (
            <div className="product-list loading">
                <div className="hero-section">
                    <div className="hero-content">
                        <h1>Welcome to Our Store</h1>
                        <p>Discover the latest trends in fashion</p>
                        <button className="btn-shop-now">Shop Now</button>
                    </div>
                </div>
                <div className="filters-section">
                    <h2>Filters</h2>
                    <div className="filters">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="filter skeleton"></div>
                        ))}
                    </div>
                </div>
                <div className="featured-products-section">
                    <h2>Featured Products</h2>
                    <div className="products-grid">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="product-card skeleton">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-title"></div>
                                <div className="skeleton-price"></div>
                                <div className="skeleton-link"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-list error">
                <div className="hero-section">
                    <div className="hero-content">
                        <h1>Welcome to Our Store</h1>
                        <p>Discover the latest trends in fashion</p>
                        <button className="btn-shop-now">Shop Now</button>
                    </div>
                </div>
                <div className="error-message">{error}</div>
                <button
                    onClick={fetchProducts}
                    className="btn-retry"
                    aria-label="Retry loading products"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="product-list">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Welcome to Our Store</h1>
                    <p>Discover the latest trends in fashion</p>
                    <button className="btn-shop-now">Shop Now</button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <h2>Filters</h2>
                <div className="filters">
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        aria-label="Filter by category"
                    >
                        <option value="">All Categories</option>
                        {['Men', 'Women', 'Kids', 'Accessories'].map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        name="minPrice"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        aria-label="Minimum price"
                    />
                    <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        aria-label="Maximum price"
                    />
                    <label>
                        <input
                            type="checkbox"
                            name="inStock"
                            checked={filters.inStock}
                            onChange={handleFilterChange}
                            aria-label="In stock only"
                        />
                        In Stock Only
                    </label>
                    <button
                        onClick={resetFilters}
                        className="btn-reset"
                        aria-label="Reset filters"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Sorting and Search Section */}
            <div className="sort-search-section">
                <div className="sort">
                    <label>Sort By:</label>
                    <select value={sort} onChange={handleSortChange} aria-label="Sort products">
                        <option value="newest">Newest Arrivals</option>
                        <option value="priceLowToHigh">Price: Low to High</option>
                        <option value="priceHighToLow">Price: High to Low</option>
                    </select>
                </div>
                <div className="search">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={handleSearch}
                        aria-label="Search products"
                    />
                </div>
            </div>

            {/* Product Count */}
            <div className="product-count">
                Showing {products.length} of {totalProducts} products
            </div>

            {/* Featured Products Section */}
            <div className="featured-products-section">
                <h2>Featured Products</h2>
                <div className="products-grid">
                    {products.map(product => (
                        <div key={product._id} className="product-card">
                            <div className="product-image">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = '/fallback-image.jpg';
                                    }}
                                />
                            </div>
                            <h3>{product.name}</h3>
                            <p className="price">${product.price.toFixed(2)}</p>
                            <Link
                                to={`/product/${product._id}`}
                                className="view-details"
                                aria-label={`View details for ${product.name}`}
                            >
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                >
                    Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                        aria-label={`Page ${index + 1}`}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                >
                    Next
                </button>
            </div>

            {/* Footer Section */}
            <div className="footer-section">
                <p>&copy; 2023 Clothing Store. All rights reserved.</p>
            </div>
        </div>
    );
};

export default ProductList;