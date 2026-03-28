import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await apiClient.get('users/profile/');
          setUser(res.data.data);
        } catch (error) {
          console.error("Auth check failed:", error);
          logoutUser();
        }
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

  const loginUser = async (email, password) => {
    try {
      const res = await apiClient.post('auth/login/', { email, password });
      
      localStorage.setItem('access_token', res.data.data.tokens.access);
      localStorage.setItem('refresh_token', res.data.data.tokens.refresh);
      setUser(res.data.data.user);
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error("Login Error", error.response?.data);
      return { success: false, error: error.response?.data };
    }
  };

  const registerUser = async (userData) => {
    try {
      const res = await apiClient.post('auth/register/', userData);
      localStorage.setItem('access_token', res.data.data.tokens.access);
      localStorage.setItem('refresh_token', res.data.data.tokens.refresh);
      setUser(res.data.data.user);
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error("Registration Error", error.response?.data);
      return { success: false, error: error.response?.data };
    }
  };

  const logoutUser = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await apiClient.post('auth/logout/', { refresh });
      }
    } catch (error) {
      console.error("Logout Error", error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login');
    }
  };

  const contextData = {
    user,
    loading,
    loginUser,
    registerUser,
    logoutUser
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
