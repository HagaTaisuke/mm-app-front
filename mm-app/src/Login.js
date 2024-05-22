import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "./authService";
import userService from "./userService";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setMessage("");

    AuthService.login(username, password).then(
      (response) => {
        console.log(response);
        userService.getUserData(response.userId).then((userResponse) => {
          console.log(userResponse.data);
          navigate("/profile");
        });
      },
      (error) => {
        setMessage(
          "Failed to login: " +
            (error.response?.data?.error || "Unexpected error")
        );
      }
    );
  };

  return (
    <div class="container">
      <form onSubmit={handleLogin}>
        <div>
          <label>ユーザー名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">ログイン</button>
      </form>
      {message && <div>{message}</div>}
      <div className="regiLink">
        <p>
          アカウントがありませんか？{" "}
          <Link to="/register">アカウントを作成</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
