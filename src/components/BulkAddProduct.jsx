import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const BulkAddProduct = () => {
    const [products, setProducts] = useState([{ name: '', price: '', description: '', stock: '', category: '', image: null }]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('products/categories', {
                    headers: { 'x-auth-token': token },
                });
                setCategories(response.data);
            } catch (err) {
                setError('Failed to load categories');
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, [navigate]);

    const validateForm = () => {
        for (const product of products) {
            if (!product.name.trim()) return 'All product names are required';
            if (!product.price || isNaN(product.price) || Number(product.price) <= 0) {
                return 'Valid price is required for all products';
            }
            if (!product.stock || isNaN(product.stock) || Number(product.stock) < 0) {
                return 'Valid stock quantity is required for all products';
            }
            if (!product.category) return 'Category is required for all products';
            if (!product.image) return 'Product image is required for all products';
        }
        return null;
    };

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const updatedProducts = [...products];
        updatedProducts[index] = { ...updatedProducts[index], [name]: value };
        setProducts(updatedProducts);
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const updatedProducts = [...products];
            updatedProducts[index] = { ...updatedProducts[index], image: file };
            setProducts(updatedProducts);
            setError(null);
        } else {
            setError('Please select a valid image file for all products');
        }
    };

    const addProductRow = () => {
        setProducts([...products, { name: '', price: '', description: '', stock: '', category: '', image: null }]);
    };

    const removeProductRow = (index) => {
        if (products.length > 1) {
            setProducts(products.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
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
            const token = localStorage.getItem('token');
            const promises = products.map((product) => {
                const data = new FormData();
                Object.entries(product).forEach(([key, value]) => {
                    if (key !== 'image') data.append(key, value);
                });
                data.append('image', product.image);
                return axios.post('/products/admin/add', data, {
                    headers: { 'x-auth-token': token },
                });
            });

            await Promise.all(promises);
            setSuccess('All products added successfully!');
            setProducts([{ name: '', price: '', description: '', stock: '', category: '', image: null }]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add products');
            console.error('Error adding bulk products:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bulk-add-product">
            <h1>Bulk Add Products</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleSubmit} noValidate encType="multipart/form-data">
                {products.map((product, index) => (
                    <div key={index} className="product-row">
                        <div className="form-group">
                            <label htmlFor={`name-${index}`}>Name</label>
                            <input
                                type="text"
                                id={`name-${index}`}
                                name="name"
                                placeholder="Enter product name"
                                value={product.name}
                                onChange={(e) => handleChange(index, e)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`price-${index}`}>Price</label>
                            <input
                                type="number"
                                id={`price-${index}`}
                                name="price"
                                placeholder="Enter price"
                                value={product.price}
                                onChange={(e) => handleChange(index, e)}
                                min="0"
                                step="0.01"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`description-${index}`}>Description</label>
                            <textarea
                                id={`description-${index}`}
                                name="description"
                                placeholder="Enter description"
                                value={product.description}
                                onChange={(e) => handleChange(index, e)}
                                rows="2"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`stock-${index}`}>Stock</label>
                            <input
                                type="number"
                                id={`stock-${index}`}
                                name="stock"
                                placeholder="Enter stock"
                                value={product.stock}
                                onChange={(e) => handleChange(index, e)}
                                min="0"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`category-${index}`}>Category</label>
                            <select
                                id={`category-${index}`}
                                name="category"
                                value={product.category}
                                onChange={(e) => handleChange(index, e)}
                                required
                                disabled={loading || categories.length === 0}
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor={`image-${index}`}>Image</label>
                            <input
                                type="file"
                                id={`image-${index}`}
                                name={`image-${index}`}
                                onChange={(e) => handleImageChange(index, e)}
                                accept="image/*"
                                required
                                disabled={loading}
                            />
                            {product.image && <p className="file-preview">Selected: {product.image.name}</p>}
                        </div>
                        {products.length > 1 && (
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeProductRow(index)}
                                disabled={loading}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <div className="form-actions">
                    <button type="button" className="add-btn" onClick={addProductRow} disabled={loading}>
                        Add Another Product
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit All Products'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BulkAddProduct;