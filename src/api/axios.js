import axios from "axios";

export const api = axios.create({
  baseURL: 'https://localhost:7153', // URL base da API
});

export const createUser = (userData) => {
  return api.post('api/user/', userData); 
};

export const loginUser = (loginData) => {
  return api.post('api/user/auth', loginData); 
};

export const getBridges = async () => {
  const response = await api.get('api/bridges');
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await api.get(`api/user/${userId}`); 
  return response.data;
};








