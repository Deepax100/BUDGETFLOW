import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bf_token');
      localStorage.removeItem('bf_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  resetData: (type) => api.delete('/auth/reset-data', { data: { type } }),
};

// Transactions
export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  export: (params) => api.get('/transactions/export', { params, responseType: 'blob' }),
  suggestCategory: (data) => api.post('/transactions/suggest-category', data),
};

// Budgets
export const budgetsAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  create: (data) => api.post('/budgets', data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

// Goals
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

// Analytics
export const analyticsAPI = {
  getSummary: (params) => api.get('/analytics/summary', { params }),
  getCharts: (params) => api.get('/analytics/charts', { params }),
  getInsights: () => api.get('/analytics/insights'),
  getCategories: () => api.get('/analytics/categories'),
};

// Subscriptions
export const subscriptionsAPI = {
  getAll: () => api.get('/subscriptions'),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
  logUsage: (id, note = '') => api.post(`/subscriptions/${id}/log-usage`, { note }),
  detect: () => api.get('/subscriptions/detect'),
  getUsageHistory: (id) => api.get(`/subscriptions/${id}/usage`),
};

// Calendar
export const calendarAPI = {
  getMonth: (month) => api.get('/calendar', { params: { month } }),
};

export default api;
