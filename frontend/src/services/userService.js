import axios from 'axios';

const API_URL = '/api/users';

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

// Get all users with optional filters
const getUsers = async (filters = {}) => {
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

// Get single user by ID
const getUserById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, tokenConfig());
  return response.data;
};

// Create user
const createUser = async (userData) => {
  const response = await axios.post(API_URL, userData, tokenConfig());
  return response.data;
};

// Update user
const updateUser = async (id, userData) => {
  const response = await axios.put(`${API_URL}/${id}`, userData, tokenConfig());
  return response.data;
};

// Delete user
const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, tokenConfig());
  return response.data;
};

const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

export default userService; 