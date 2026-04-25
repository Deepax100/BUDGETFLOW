import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('bf_user') || 'null'),
  token: localStorage.getItem('bf_token') || null,
  isAuthenticated: !!localStorage.getItem('bf_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('bf_token', data.token);
      localStorage.setItem('bf_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register({ name, email, password });
      localStorage.setItem('bf_token', data.token);
      localStorage.setItem('bf_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('bf_token');
    localStorage.removeItem('bf_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  updateUser: (user) => {
    localStorage.setItem('bf_user', JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
