// src/ProtectedRoute.jsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { API_URL, setCurrentUser, logout } from "./api";

export default function ProtectedRoute({ children, requireComplete = false }) {
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "unauth"
  const [user, setUser]     = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("unauthenticated");
        return r.json();
      })
      .then((data) => {
        setCurrentUser(data.user); // keep localStorage display info fresh
        setUser(data.user);
        setStatus("ok");
      })
      .catch(() => {
        logout();
        setStatus("unauth");
      });
  }, []);

  if (status === "loading") return null; // brief blank while cookie is verified
  if (status === "unauth")  return <Navigate to="/login" replace />;
  if (requireComplete && user?.profile_complete === false) {
    return <Navigate to="/setup" replace />;
  }
  return children;
}
