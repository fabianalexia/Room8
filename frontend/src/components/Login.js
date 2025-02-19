import React, { useState } from "react";
import { loginUser } from "../api/api"; // Ensure API functions exist

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const [token, setToken] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(formData);
            setToken(response.data.token);
            setMessage("Login successful!");
            localStorage.setItem("jwt", response.data.token); // Store token
        } catch (error) {
            setMessage(error.response?.data?.error || "Login failed.");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
            {token && <p>Your JWT Token: {token}</p>}
        </div>
    );
};

export default Login;
