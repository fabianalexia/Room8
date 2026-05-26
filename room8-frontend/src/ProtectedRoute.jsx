// src/ProtectedRoute.jsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getToken, getMe, setCurrentUser, logout } from "./api";

export default function ProtectedRoute({ children, requireComplete = false }) {
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "unauth"
  const [user, setUser]     = useState(null);

  useEffect(() => {
    const token = getToken();
    console.log("[ProtectedRoute] token:", token ? `${token.slice(0, 20)}...` : null);

    if (!token) {
      console.log("[ProtectedRoute] no token → unauth");
      setStatus("unauth");
      return;
    }

    // Use the shared doFetch-backed helper so the Authorization header
    // is built identically to every other authenticated API call.
    getMe()
      .then((data) => {
        console.log("[ProtectedRoute] /me response:", data);
        setCurrentUser(data.user);
        setUser(data.user);
        setStatus("ok");
      })
      .catch((err) => {
        console.error("[ProtectedRoute] /me error:", err.message);
        logout();
        setStatus("unauth");
      });
  }, []);

  if (status === "loading") return null;
  if (status === "unauth")  return <Navigate to="/login" replace />;
  if (requireComplete && !user?.profile_complete) {
    return <Navigate to="/setup" replace />;
  }
  return children;
}
