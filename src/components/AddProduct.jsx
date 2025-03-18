import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        stock: '',
        category: ''
    });
    const [image, setImage] = useState(null);
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
        if (!formData.name.trim()) return 'Product name is required';
        if (!formData.price || isNaN(formData.price)) {
            return 'Valid price is required';
        }
        if (Number(formData.price) <= 0){
            return 'Price must be greater than 0';
        }
        if (!formData.stock || isNaN(formData.stock) || Number(formData.stock) < 0) {
            return 'Valid stock quantity is required';
        }
        if (!formData.category) return 'Category is required';
        if (!image) return 'Product image is required';
        return null;
    };

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

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('stock', formData.stock);
        data.append('category', formData.category);
        data.append('image', image); // Ensure this is the file object

        console.log('FormData:', Array.from(data.entries())); // Debug FormData

        try {
            const response = await axios.post('/products/admin/add', data, {
                headers: {
                    'x-auth-token': localStorage.getItem('token'),
                    'Content-Type': 'multipart/form-data', // Ensure this is set
                },
            });

            if (response.status === 201) {
                setSuccess('Product added successfully!');
                const productId = response.data.product?._id; // Use _id for MongoDB
                if (productId) {
                    navigate(`/product/${productId}`); // Navigate to product details
                } else {
                    console.error('No product ID in response:', response.data);
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add product');
            console.error('Error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product">
            <h1>Add Product</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleSubmit} noValidate encType="multipart/form-data">
                <div className="form-group">
                    <label htmlFor="name">Product Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter product name"
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
                        placeholder="Enter price"
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
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="stock">Stock</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        placeholder="Enter stock quantity"
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
                    <label htmlFor="image">Product Image</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                        required
                        disabled={loading}
                    />
                    {image && <p className="file-preview">Selected: {image.name}</p>}
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Product'}
                </button>
            </form>
        </div>
    );
};

export default AddProduct;