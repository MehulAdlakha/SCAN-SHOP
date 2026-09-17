import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalTax: 0, total: 0 });
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize session ID
  useEffect(() => {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', sid);
    }
    setSessionId(sid);
  }, []);

  // Load user from token
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const addToCart = (item) => {
    const existingItemIndex = cart.items.findIndex(i => i.productId === item.productId);
    let newItems = [...cart.items];

    if (existingItemIndex > -1) {
      newItems[existingItemIndex].quantity += item.quantity;
    } else {
      newItems.push(item);
    }

    updateCart(newItems);
  };

  const updateCartItem = (productId, quantity) => {
    let newItems = cart.items.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0);

    updateCart(newItems);
  };

  const removeFromCart = (productId) => {
    const newItems = cart.items.filter(item => item.productId !== productId);
    updateCart(newItems);
  };

  const clearCart = () => {
    setCart({ items: [], subtotal: 0, totalTax: 0, total: 0 });
  };

  const updateCart = (items) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const totalTax = items.reduce((sum, item) => {
      const itemPrice = item.price * item.quantity;
      return sum + (itemPrice * (item.taxRate / 100));
    }, 0);

    const total = subtotal + totalTax;

    setCart({ items, subtotal, totalTax, total });
  };

  const value = {
    user,
    cart,
    sessionId,
    loading,
    login,
    register,
    logout,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
