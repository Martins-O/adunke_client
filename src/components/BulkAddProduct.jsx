import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const BulkAddProduct = () => {
    const [products, setProducts] = useState([{
        name: '',
        price: '',
        discountPercent: '',
        description: '',
        stock: '',
        category: '',
        sizes: [], // Change to array
        colors: '',
        tags: '',
        isFeatured: false,
        images: [],
    }]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    // Static size options based on backend schema
    const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];

    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('/api/products/categories', {
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
        for (const product of products) {
            if (!product.name.trim()) return 'All product names are required';
            if (!product.price || isNaN(product.price) || Number(product.price) <= 0) return 'Valid price greater than 0 is required for all products';
            if (product.discountPercent && (isNaN(product.discountPercent) || Number(product.discountPercent) < 0 || Number(product.discountPercent) > 100)) {
                return 'Discount percent must be between 0 and 100 for all products';
            }
            if (!product.stock || isNaN(product.stock) || Number(product.stock) < 0) return 'Valid stock quantity is required for all products';
            if (!product.category) return 'Category is required for all products';
            if (product.images.length === 0) return 'At least one image is required for all products';
        }
        return null;
    };

    const handleChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedProducts = [...products];
        if (name === 'sizes') {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            updatedProducts[index] = { ...updatedProducts[index], sizes: selectedOptions };
        } else {
            updatedProducts[index] = { ...updatedProducts[index], [name]: type === 'checkbox' ? checked : value };
        }
        setProducts(updatedProducts);
    };

    const handleImageChange = (index, e) => {
        const files = Array.from(e.target.files);
        const validImages = files.filter(file => file instanceof File && file.type.startsWith('image/'));
        if (validImages.length !== files.length) {
            setError('Please select only valid image files');
        } else {
            const updatedProducts = [...products];
            updatedProducts[index] = { ...updatedProducts[index], images: validImages };
            setProducts(updatedProducts);
            setError(null);
        }
    };

    const addProductRow = () => {
        setProducts([...products, {
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
            images: [],
        }]);
    };

    const removeProductRow = (index) => {
        if (products.length > 1) setProducts(products.filter((_, i) => i !== index));
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
        const productsData = products.map(product => ({
            name: product.name,
            price: product.price,
            discountPercent: product.discountPercent || 0,
            description: product.description,
            stock: product.stock,
            category: product.category,
            sizes: product.sizes.join(','), // Join array into string
            colors: product.colors,
            tags: product.tags,
            isFeatured: product.isFeatured,
            imageCount: product.images.length,
        }));
        data.append('products', JSON.stringify(productsData));
        products.forEach((product) => {
            product.images.forEach((image) => data.append('images', image));
        });

        try {
            const response = await axios.post('/api/products/admin/bulk', data, {
                headers: { 'x-auth-token': localStorage.getItem('token') },
            });

            if (response.status === 201) {
                setSuccess('All products added successfully!');
                setProducts([{
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
                    images: [],
                }]);
                setTimeout(() => navigate('/admin'), 1000);
            }
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
                {products.map((product, index) => {
                    const discountPrice = product.discountPercent && product.price
                        ? (product.price * (1 - product.discountPercent / 100)).toFixed(2)
                        : product.price;
                    return (
                        <div key={index} className="product-row">
                            <div className="form-group">
                                <label htmlFor={`name-${index}`}>Name</label>
                                <input type="text" id={`name-${index}`} name="name" value={product.name} onChange={(e) => handleChange(index, e)} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`price-${index}`}>Price (₦)</label>
                                <input type="number" id={`price-${index}`} name="price" value={product.price} onChange={(e) => handleChange(index, e)} min="0" step="0.01" required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`discountPercent-${index}`}>Discount Percent (%)</label>
                                <input type="number" id={`discountPercent-${index}`} name="discountPercent" value={product.discountPercent} onChange={(e) => handleChange(index, e)} min="0" max="100" step="1" disabled={loading} />
                                {product.discountPercent > 0 && (
                                    <p>Original: ₦{product.price} | Discounted: ₦{discountPrice}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor={`description-${index}`}>Description</label>
                                <textarea id={`description-${index}`} name="description" value={product.description} onChange={(e) => handleChange(index, e)} rows="2" disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`stock-${index}`}>Stock</label>
                                <input type="number" id={`stock-${index}`} name="stock" value={product.stock} onChange={(e) => handleChange(index, e)} min="0" required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`category-${index}`}>Category</label>
                                <select id={`category-${index}`} name="category" value={product.category} onChange={(e) => handleChange(index, e)} required disabled={loading || categories.length === 0}>
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor={`sizes-${index}`}>Sizes (Hold Ctrl/Cmd to select multiple)</label>
                                <select
                                    id={`sizes-${index}`}
                                    name="sizes"
                                    value={product.sizes}
                                    onChange={(e) => handleChange(index, e)}
                                    multiple
                                    disabled={loading}
                                >
                                    {sizeOptions.map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor={`colors-${index}`}>Colors</label>
                                <input type="text" id={`colors-${index}`} name="colors" value={product.colors} onChange={(e) => handleChange(index, e)} disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`tags-${index}`}>Tags</label>
                                <input type="text" id={`tags-${index}`} name="tags" value={product.tags} onChange={(e) => handleChange(index, e)} disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`isFeatured-${index}`}>Featured</label>
                                <input type="checkbox" id={`isFeatured-${index}`} name="isFeatured" checked={product.isFeatured} onChange={(e) => handleChange(index, e)} disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`images-${index}`}>Images</label>
                                <input type="file" id={`images-${index}`} name="images" onChange={(e) => handleImageChange(index, e)} accept="image/*" multiple required disabled={loading} />
                                {product.images.length > 0 && (
                                    <p className="file-preview">Selected: {product.images.map(img => img.name).join(', ')}</p>
                                )}
                            </div>
                            {products.length > 1 && (
                                <button type="button" className="remove-btn" onClick={() => removeProductRow(index)} disabled={loading}>
                                    Remove
                                </button>
                            )}
                        </div>
                    );
                })}
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