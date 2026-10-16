// API Configuration
// Centralized backend URL configuration from environment variable
// In production (served by Express on cPanel), relative path ''
// routes all API requests directly to the current host (e.g. https://ecoscan-web.dev-myproject.my.id)

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== ''
    ? import.meta.env.VITE_API_BASE_URL
    : (import.meta.env.PROD ? '' : 'http://localhost:3030');

export default API_BASE_URL;
