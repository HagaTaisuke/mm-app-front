import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const login = (username, password) => {
  return axios.post(`${API_URL}/login`, null, {
    params: {
      username,
      password,
    },
  });
};

export const register = (username, email, password) => {
  return axios.post(`${API_URL}/register`, {
    username,
    email,
    password,
  });
};
