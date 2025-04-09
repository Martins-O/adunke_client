import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        discountPercent: '',
        description: '',
        stock: '',
        category: '',
        sizes: [],
        colors: '',
        tags: '',
        isFeatured: false,
    });
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];

    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('/products/categories', {
                    headers: { 'x-auth-token': token },
                });
                setCategories(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load categories');
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, [navigate]);

    const validateForm = () => {
        if (!formData.name.trim()) return 'Product name is required';
        if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) return 'Valid price greater than 0 is required';
        if (formData.discountPercent && (isNaN(formData.discountPercent) || Number(formData.discountPercent) < 0 || Number(formData.discountPercent) > 100)) {
            return 'Discount percent must be between 0 and 100';
        }
        if (!formData.stock || isNaN(formData.stock) || Number(formData.stock) < 0) return 'Valid stock quantity is required';
        if (!formData.category) return 'Category is required';
        if (images.length === 0) return 'At least one product image is required';
        return null;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'sizes') {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            setFormData((prev) => ({ ...prev, sizes: selectedOptions }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const validImages = files.filter(file => file instanceof File && file.type.startsWith('image/'));
        if (validImages.length !== files.length) {
            setError('Please select only valid image files');
        } else {
            setImages(validImages);
            setError(null);
            console.log('Selected images:', validImages);
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

        if (images.length === 0) {
            setError('No images selected');
            setLoading(false);
            return;
        }

        console.log('Images before FormData:', images);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'sizes') {
                data.append('sizes', value.join(','));
            } else {
                data.append(key, value);
            }
        });
        images.forEach((image) => data.append('images', image, image.name));
        for (const [key, value] of data.entries()) {
            console.log(`FormData entry: ${key} =`, value instanceof File ? `[File: ${value.name}]` : value);
        }

        try {
            const response = await axios.post('/products/admin/add', data, {
                headers: { 'x-auth-token': localStorage.getItem('token') },
            });

            if (response.status === 201) {
                setSuccess('Product added successfully!');
                const productId = response.data.product?._id;
                if (productId) setTimeout(() => navigate(`/product/${productId}`), 1000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add product');
            console.error('Error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        navigate('/admin'); // Adjust this path to your admin dashboard route
    };

    const discountPrice = formData.discountPercent && formData.price
        ? (formData.price * (1 - formData.discountPercent / 100)).toFixed(2)
        : formData.price;

    return (
        <div className="add-product">
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
                ← Back to Dashboard
            </button>
            <h1>Add Product</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleSubmit} noValidate encType="multipart/form-data">
                <div className="form-group">
                    <label htmlFor="name">Product Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price (₦)</label>
                    <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" required disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="discountPercent">Discount Percent (%)</label>
                    <input type="number" id="discountPercent" name="discountPercent" value={formData.discountPercent} onChange={handleChange} min="0" max="100" step="1" disabled={loading} />
                    {formData.discountPercent > 0 && (
                        <p>Original Price: ₦{formData.price} | Discounted Price: ₦{discountPrice}</p>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="stock">Stock</label>
                    <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} min="0" required disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required disabled={loading || categories.length === 0}>
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="sizes">Sizes (Hold Ctrl/Cmd to select multiple)</label>
                    <select id="sizes" name="sizes" value={formData.sizes} onChange={handleChange} multiple disabled={loading}>
                        {sizeOptions.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="colors">Colors (comma-separated)</label>
                    <input type="text" id="colors" name="colors" value={formData.colors} onChange={handleChange} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="tags">Tags (comma-separated)</label>
                    <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="isFeatured">Featured Product</label>
                    <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="images">Product Images (multiple)</label>
                    <input type="file" id="images" name="images" onChange={handleImageChange} accept="image/*" multiple required disabled={loading} />
                    {images.length > 0 && (
                        <p className="file-preview">Selected: {images.map(img => img.name).join(', ')}</p>
                    )}
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Product'}
                </button>
            </form>
        </div>
    );
};

export default AddProduct;