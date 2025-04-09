import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Login from './components/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BulkAddProduct from './components/BulkAddProduct.jsx';
import Dashboard from './components/Dashboard.jsx';
import AddProduct from './components/AddProduct.jsx';
import UpdateProduct from './components/UpdateProduct.jsx';
import { setupInterceptors } from './utils/axiosConfig';

// Component to handle routes and interceptor setup
function AppContent() {
    const navigate = useNavigate();

    useEffect(() => {
        setupInterceptors(navigate); // Pass the navigate function
    }, [navigate]);

    return (
        <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/add"
                element={
                    <ProtectedRoute>
                        <AddProduct />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/bulk-add"
                element={
                    <ProtectedRoute>
                        <BulkAddProduct />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/update/:id"
                element={
                    <ProtectedRoute>
                        <UpdateProduct />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;