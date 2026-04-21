// src/LoginForm.jsx
import React, { useState } from "react";
import { login } from "./api";

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await login(form); // POST /auth/login
      // If your backend returns { error: "msg" } on failure:
      if (res?.error) {
        setErr(res.error);
      } else {
        // Expecting { user, token? } – adjust to your actual payload
        if (res?.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
        } else {
          // fallback: store the whole response if it only returns user fields
          localStorage.setItem("user", JSON.stringify(res));
        }
        if (onLogin) onLogin(res.user ?? res);
        // easiest way to refresh app state
        window.location.reload();
      }
    } catch (e2) {
      setErr("Login failed. Please try again.");
      console.error(e2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {err && <p style={{ color: "red" }}>{err}</p>}

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}