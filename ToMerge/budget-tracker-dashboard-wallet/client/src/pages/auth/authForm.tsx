import React, { useState } from "react";
import "../auth/authForm.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthForm: React.FC = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("https://localhost:7173/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      login(data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="simple-auth-box">
        <form onSubmit={handleLogin}>
          <div className="form-header">
            <h1>Login</h1>
          </div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Sign In</button>
          {error && <p className="error-msg">{error}</p>}
          <p className="register-link">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")}>Create one</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
