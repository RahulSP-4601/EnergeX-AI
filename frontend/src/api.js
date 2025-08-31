// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, '') + '/api' || '/api',
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: normalize error message and bubble 401s
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // token expired/invalid—log out cleanly
      localStorage.removeItem('jwt');
      // You can also broadcast an event if you want to auto-redirect
      window.dispatchEvent(new Event('jwt-expired'));
    }
    return Promise.reject(err);
  }
);

export default api;
