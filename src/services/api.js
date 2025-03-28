import axios from 'axios';

// Base URL for API
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://localhost:5001';

// Setup axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Create token config utility function
export const getTokenConfig = () => {
  // Get token from localStorage
  const userString = localStorage.getItem('user');
  
  if (!userString) {
    return {
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
  
  const user = JSON.parse(userString);
  
  // Setup config with token
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // If token exists, add to headers
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  
  return config;
};

// Create API request utility
export const apiRequest = async (method, url, data = null) => {
  try {
    const config = getTokenConfig();
    
    const response = await axios({
      method,
      url,
      data,
      ...config
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'An error occurred',
      statusCode: error.response?.status
    };
  }
};

// Helper methods
export const get = (url) => apiRequest('get', url);
export const post = (url, data) => apiRequest('post', url, data);
export const put = (url, data) => apiRequest('put', url, data);
export const del = (url) => apiRequest('delete', url);

export default {
  get,
  post,
  put,
  delete: del,
  getTokenConfig
}; 