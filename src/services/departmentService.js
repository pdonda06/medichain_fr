import axios from 'axios';

const API_URL = '/api/departments';

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

// Get all departments with optional filters
const getDepartments = async (filters = {}) => {
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

// Get departments by facility ID
const getDepartmentsByFacility = async (facilityId) => {
  const response = await axios.get(`${API_URL}/facility/${facilityId}`, tokenConfig());
  return response.data;
};

// Get single department by ID
const getDepartmentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, tokenConfig());
  return response.data;
};

// Create department
const createDepartment = async (departmentData) => {
  const response = await axios.post(API_URL, departmentData, tokenConfig());
  return response.data;
};

// Update department
const updateDepartment = async (id, departmentData) => {
  const response = await axios.put(`${API_URL}/${id}`, departmentData, tokenConfig());
  return response.data;
};

// Delete department
const deleteDepartment = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, tokenConfig());
  return response.data;
};

const departmentService = {
  getDepartments,
  getDepartmentsByFacility,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};

export default departmentService; 