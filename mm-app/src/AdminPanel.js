import React from 'react';
import userService from './userService';

const AdminPanel = () => {
    const handleDeleteAllUsers = () => {
        userService.deleteAllUsers().then(() => {
            alert('All users have been deleted.');
        }).catch(error => {
            console.error('Failed to delete users:', error);
        });
    };

    return (
        <div>
            <h1>Admin Panel</h1>
            <button onClick={handleDeleteAllUsers}>Delete All Users</button>
        </div>
    );
};

export default AdminPanel;
