// file that connects the backend to the frontend
// axios for api calls

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend port
});

// Automatically add the JWT token to every request
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage'); // Zustand storage key
  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

export default api;