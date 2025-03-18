import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const UpdateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', price: '', description: '', stock: '', category: '',
    });
    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchProductAndCategories = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                const [productResponse, categoriesResponse] = await Promise.all([
                    axios.get(`/products/${id}`, { headers: { 'x-auth-token': token } }),
                    axios.get('/products/categories', { headers: { 'x-auth-token': token } }),
                ]);

                setFormData({
                    name: productResponse.data.name,
                    price: productResponse.data.price.toString(),
                    description: productResponse.data.description || '',
                    stock: productResponse.data.stock.toString(),
                    category: productResponse.data.category,
                });
                setCategories(categoriesResponse.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load product data');
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductAndCategories();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            setError(null);
        } else {
            setError('Please select a valid image file');
            setImage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));
        if (image) data.append('image', image);

        try {
            const response = await axios.patch(`/products/admin/update/${id}`, data, {
                headers: { 'x-auth-token': localStorage.getItem('token') },
            });
            if (response.status === 200) {
                setSuccess('Product updated successfully!');
                setImage(null);
                e.target.reset();
                setTimeout(() => navigate('/admin'), 2000); // Redirect after 2s
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product');
            console.error('Error updating product:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="update-product">
            <h1>Update Product</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="stock">Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Update Image (optional)</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            disabled={loading}
                        />
                        {image && <p className="file-preview">Selected: {image.name}</p>}
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Product'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default UpdateProduct;