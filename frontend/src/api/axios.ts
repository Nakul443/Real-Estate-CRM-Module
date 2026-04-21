// used to make asynchronous network requests from browsers or node.js to servers
// every time the backend is called, it automatically attaches user's JWT token
// which is required for RBAC

import axios from 'axios';

const api = axios.create({
  // This must match your Node.js server port
  baseURL: 'http://localhost:5000/api', 
});

// Interceptor to automatically add the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;