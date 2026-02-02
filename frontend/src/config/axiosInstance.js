import axios from 'axios';
import API_BASE_URL from './api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Response interceptor to centralize error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log as error only
    console.error('API Error:', error.response?.status, error.message);
    // Normalize error message
    const message = error.response?.data?.message || error.message || 'Unknown API error';
    return Promise.reject({ ...error, message });
  }
);

export default instance;
