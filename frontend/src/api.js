import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // proxied to http://localhost:8000/api
});

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
