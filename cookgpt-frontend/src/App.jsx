import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/profile/Profile';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import OrderTrack from './pages/customer/OrderTrack';
import CookGPT from './pages/customer/CookGPT';

import Dashboard from './pages/admin/Dashboard';
import KdsOrders from './pages/admin/KdsOrders';
import MenuManagement from './pages/admin/MenuManagement';

import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id/track" element={<OrderTrack />} />
          <Route path="/cookgpt" element={<CookGPT />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/orders" element={<KdsOrders />} />
          <Route path="/admin/menu" element={<MenuManagement />} />

          {/* Delivery Route */}
          <Route path="/delivery" element={<DeliveryDashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
