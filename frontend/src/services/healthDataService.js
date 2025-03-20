import axios from 'axios';

const API_URL = '/api/health-data';

// Create token config
const tokenConfig = () => {
  // Get token from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
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

// Create new health data
const createHealthData = async (healthData) => {
  const response = await axios.post(API_URL, healthData, tokenConfig());
  return response.data;
};

// Get health data with optional filters
const getHealthData = async (filters = {}) => {
  // Convert filters to query string
  const queryString = Object.keys(filters)
    .map(key => `${key}=${filters[key]}`)
    .join('&');
    
  const response = await axios.get(
    `${API_URL}${queryString ? `?${queryString}` : ''}`, 
    tokenConfig()
  );
  
  return response.data;
};

// Get health data by ID
const getHealthDataById = async (id) => {
  try {
    console.log('Fetching health data by ID:', id);
    // Get user token from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    };
    
    const response = await axios.get(`${API_URL}/${id}`, config);
    console.log('Health data found:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching health data by ID:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Update health data
const updateHealthData = async (id, healthData) => {
  const response = await axios.put(`${API_URL}/${id}`, healthData, tokenConfig());
  return response.data;
};

// Delete health data
const deleteHealthData = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, tokenConfig());
  return response.data;
};

// Get aggregated health data report
const getAggregatedReport = async (filters = {}) => {
  // Convert filters to query string
  const queryString = Object.keys(filters)
    .map(key => `${key}=${filters[key]}`)
    .join('&');
    
  const response = await axios.get(
    `${API_URL}/report${queryString ? `?${queryString}` : ''}`, 
    tokenConfig()
  );
  
  return response.data;
};

const healthDataService = {
  createHealthData,
  getHealthData,
  getHealthDataById,
  updateHealthData,
  deleteHealthData,
  getAggregatedReport
};

export default healthDataService; 