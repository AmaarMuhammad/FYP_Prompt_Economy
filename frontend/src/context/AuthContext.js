import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useWallet } from './WalletContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Configure axios defaults
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const { account, signMessage } = useWallet();

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Load user profile
  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`);
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Load user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Login with wallet
  const walletLogin = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return { success: false };
    }

    try {
      setLoading(true);

      // Get nonce
      const nonceResponse = await axios.get(
        `${API_URL}/auth/nonce/${account}`
      );
      
      const { message, isNewUser } = nonceResponse.data.data;

      if (isNewUser) {
        toast.error('Account not found. Please register first.');
        return { success: false, requiresRegistration: true };
      }

      // Sign message
      const signature = await signMessage(message);

      // Authenticate with backend
      const response = await axios.post(`${API_URL}/auth/wallet-connect`, {
        walletAddress: account,
        signature,
        message,
      });

      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      toast.success('Wallet connected & authenticated!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Wallet authentication failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/users/profile`, profileData);
      setUser(response.data.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    walletLogin,
    logout,
    updateProfile,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
