import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/meta/categories'),
};

// Cart APIs
export const cartAPI = {
  get: (sessionId) => api.get(`/cart/${sessionId}`),
  addItem: (sessionId, item) => api.post(`/cart/${sessionId}/add`, item),
  updateItem: (sessionId, productId, quantity) =>
    api.put(`/cart/${sessionId}/item/${productId}`, { quantity }),
  removeItem: (sessionId, productId) =>
    api.delete(`/cart/${sessionId}/item/${productId}`),
  clear: (sessionId) => api.delete(`/cart/${sessionId}`),
};

// Order APIs
export const orderAPI = {
  create: (orderData) => api.post('/orders/create', orderData),
  confirmPayment: (orderId) => api.post(`/orders/${orderId}/confirm-payment`),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  getAll: (params) => api.get('/orders', { params }),
  getBill: (orderId) => api.get(`/orders/${orderId}/bill`),
};

// Exchange APIs
export const exchangeAPI = {
  initiate: (orderId) => api.post('/exchange/initiate', { orderId }),
  process: (exchangeData) => api.post('/exchange/process', exchangeData),
  complete: (exchangeId) => api.post(`/exchange/${exchangeId}/complete`),
  getById: (exchangeId) => api.get(`/exchange/${exchangeId}`),
  getAll: () => api.get('/exchange'),
};

// Verification APIs
export const verificationAPI = {
  verify: (orderNumber) => api.post('/verification/verify', { orderNumber }),
  check: (orderId) => api.get(`/verification/check/${orderId}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getSales: (params) => api.get('/admin/sales', { params }),
  getExchanges: () => api.get('/admin/exchanges'),
  getProductPerformance: () => api.get('/admin/products/performance'),
};
// Analytics API
export const analyticsAPI = {
  trackScan: (productId) => api.post('/analytics/track-scan', { productId }),
  getHeatmap: () => api.get('/analytics/heatmap')
};
export default api;
