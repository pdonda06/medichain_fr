import axios from 'axios';

const API_URL = '/api/facilities';

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

// Get all facilities with optional filters
const getFacilities = async (filters = {}) => {
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

// Get single facility by ID
const getFacilityById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, tokenConfig());
  return response.data;
};

// Create facility
const createFacility = async (facilityData) => {
  const response = await axios.post(API_URL, facilityData, tokenConfig());
  return response.data;
};

// Update facility
const updateFacility = async (id, facilityData) => {
  const response = await axios.put(`${API_URL}/${id}`, facilityData, tokenConfig());
  return response.data;
};

// Delete facility
const deleteFacility = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, tokenConfig());
  return response.data;
};

const facilityService = {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility
};

export default facilityService; 