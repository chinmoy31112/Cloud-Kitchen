import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/profile/Profile';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';

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
          
          {/* Placeholder route for orders */}
          <Route path="/orders" element={<Home />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
