// file that connects the backend to the frontend
// axios for api calls

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend port
});

// Automatically add the JWT token to every request
api.interceptors.request.use((config) => {
  // Pulling directly from localStorage to match authStore.ts logic
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept responses to handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401, the token is likely invalid or expired
    if (error.response?.status === 401) {
      if (localStorage.getItem('token')) {
        alert("Session expired. Please log in again.");
      }
    }
    return Promise.reject(error);
  }
);

export default api;