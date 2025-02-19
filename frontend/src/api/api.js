import axios from "axios";

const API_URL = "http://127.0.0.1:5000"; // Your Flask backend URL

// Register a new user
export const registerUser = async (userData) => {
    return axios.post(`${API_URL}/register`, userData);
};

// Login user and get JWT token
export const loginUser = async (userData) => {
    return axios.post(`${API_URL}/login`, userData);
};

// Get protected data (Example)
export const getProtectedData = async (token) => {
    return axios.get(`${API_URL}/protected`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
