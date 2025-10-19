// src/services/authService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export const registerUser = async (userData) => {
  return await axios.post(`${API}/auth/register`, userData);
};

export const loginUser = async (userData) => {
  return await axios.post(`${API}/auth/login`, userData);
};
