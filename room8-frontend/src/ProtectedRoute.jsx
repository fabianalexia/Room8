// src/ProtectedRoute.jsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getToken, setCurrentUser, logout } from "./api";

export default function ProtectedRoute({ children, requireComplete = false }) {
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "unauth"
  const [user, setUser]     = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus("unauth");
      return;
    }

    // Validate token and refresh user data via /api/auth/me.
    // doFetch (called inside api helpers) automatically sends Authorization: Bearer.
    fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("unauthenticated");
        return r.json();
      })
      .then((data) => {
        setCurrentUser(data.user);
        setUser(data.user);
        setStatus("ok");
      })
      .catch(() => {
        logout();
        setStatus("unauth");
      });
  }, []);

  if (status === "loading") return null;
  if (status === "unauth")  return <Navigate to="/login" replace />;
  if (requireComplete && user?.profile_complete === false) {
    return <Navigate to="/setup" replace />;
  }
  return children;
}
