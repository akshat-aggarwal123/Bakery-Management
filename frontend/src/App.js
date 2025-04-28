import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Header/Navbar';
import LandingPage from './components/LandingPage';
import ProductList from './components/Products/ProductList';
import LoginForm from './components/AuthForms/LoginForm';
import RegisterForm from './components/AuthForms/RegisterForm';
import Cart from './components/Cart/Cart';
import OrderStatus from './components/OrderStatus';
import AdminDashboard from './components/Admin/AdminDashboard'; // New import
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-status" element={<OrderStatus />} />
        {/* Admin Route */}
        <Route
          path="/admin/products"
          element={<AdminDashboard />}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;