import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from './authService';
import userService from './userService';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setMessage('');

        AuthService.login(username, password).then(
            (response) => {
                // ログイン成功時にユーザー情報を取得
                console.log(response);
                userService.getUserData(response.userId).then(userResponse => {
                    // 必要に応じてユーザー情報を保存または表示
                    console.log(userResponse.data);
                    // ログイン成功後にプロフィールページに遷移
                    navigate('/profile');
                });
            },
            (error) => {
                setMessage('Failed to login: ' + (error.response?.data?.error || 'Unexpected error'));
            }
        );
    };

    return (
        <div>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit">Login</button>
            </form>
            {message && <div>{message}</div>}
            <div className="regiLink">
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
        </div>
    );
};

export default Login;



