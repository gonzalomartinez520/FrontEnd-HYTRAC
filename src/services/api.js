import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,           // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptors later for auth tokens, logging, etc.

export default api;