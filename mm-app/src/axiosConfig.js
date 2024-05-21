// src/services/axiosConfig.js
import axios from 'axios';
import AuthService from './authService';

const instance = axios.create({
    baseURL: 'http://localhost:8080',
});

instance.interceptors.request.use((config) => {
    const user = AuthService.getCurrentUser();
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default instance;
