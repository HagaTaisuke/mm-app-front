// src/services/userService.js
import axios from './axiosConfig';

const getUserData = (id) => {
    return axios.get(`/api/users/${id}`);
};

const deleteAllUsers = () => {
    return axios.delete('/api/users/all');
};

export default {
    getUserData,
    deleteAllUsers,
};
