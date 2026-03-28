import axios from 'axios';

// Base API configuration referencing our Django backend API
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the JWT token securely to every request
apiClient.interceptors.request.use(
  (config) => {
    // Attempt to grab token from localStorage
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // If the token exists, attach it as a Bearer token
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle generalized errors or token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Extract response details
    const originalRequest = error.config;
    
    // Check if the error is due to an unauthorized/expired token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Attempt to refresh the token using your /api/v1/auth/refresh/ endpoint
          const res = await axios.post(`${API_BASE_URL}auth/refresh/`, {
            refresh: refreshToken
          });
          
          if (res.data.access) {
            // Save the new access token
            localStorage.setItem('access_token', res.data.access);
            
            // Retry the original request
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
            originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // If the refresh token also fails, clear storage and drop the user to login
        console.error('Session expired. Please log in again.', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Optional: window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
