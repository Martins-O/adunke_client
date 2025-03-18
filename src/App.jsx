import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Login from "./components/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BulkAddProduct from "./components/BulkAddProduct.jsx";
import Dashboard from "./components/Dashboard.jsx";
import AddProduct from "./components/AddProduct.jsx";
import Home from "./components/Home.jsx";
import UpdateProduct from "./components/UpdateProduct.jsx";

function App() {
    return (
        <Router>
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
                /><Route
                    path="/admin/add"
                    element={
                        <ProtectedRoute>
                            <AddProduct />
                        </ProtectedRoute>
                    }
                /><Route
                    path="/admin/bulk-add"
                    element={
                        <ProtectedRoute>
                            <BulkAddProduct />
                        </ProtectedRoute>
                    }
                /><Route
                    path="/admin/update/:id"
                    element={
                        <ProtectedRoute>
                            <UpdateProduct />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<h1>404 Not Found</h1>} />
            </Routes>
        </Router>
    );
}

export default App;