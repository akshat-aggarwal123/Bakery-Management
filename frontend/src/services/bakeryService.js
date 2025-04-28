import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Auth
// src/services/bakeryService.js (frontend)
export const registerUser = async (email, password, is_Admin = false) => {
  const response = await axios.post(`${API_URL}/register`, { 
    email, 
    password,
    is_Admin  // Include this field
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
  return response.data;
};

export const logoutUser = async () => {
  await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
};

export const validateToken = async () => {
  const response = await axios.get(`${API_URL}/validate-token`, { withCredentials: true });
  return response.data.user;
};

// Products
export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const createProduct = async (name, price, quantity) => {
  const response = await axios.post(`${API_URL}/products`, { name, price, quantity }, { withCredentials: true });
  return response.data;
};

// Cart
export const addToCart = async (productId, quantity) => {
  const response = await axios.post(`${API_URL}/cart`, { productId, quantity }, { withCredentials: true });
  return response.data;
};

export const getCart = async () => {
  const response = await axios.get(`${API_URL}/cart`, { withCredentials: true });
  return response.data;
};

// Orders
// Frontend service update
export const placeOrder = async (productId, quantity) => {
  // Get userId from auth context or cookie
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const response = await axios.post(`${API_URL}/orders`, { 
    userId: user.id,  // Include this if your backend requires it
    productId, 
    quantity 
  }, { withCredentials: true });
  return response.data;
};

export const getOrderStatus = async (orderId) => {
  const response = await axios.get(`${API_URL}/orders/${orderId}`, { withCredentials: true });
  return response.data;
};