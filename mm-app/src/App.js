import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Register from "./Register";
import Login from "./Login";
import Profile from "./Profile";
import Transactions from "./Transactions";
import AdminPanel from "./AdminPanel";

const App = () => {
  return (
    <Router>
      <div className="wrapper">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/Transactions" element={<Transactions />} />
          <Route exact path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
