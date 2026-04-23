// src/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requireComplete = false }) {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  })();

  if (!user) return <Navigate to="/login" replace />;
  if (requireComplete && user.profile_complete === false) {
    return <Navigate to="/setup" replace />;
  }
  return children;
}
