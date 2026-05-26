// src/pages/AuthCallbackPage.jsx
// Receives the JWT from the OAuth backend redirect and logs the user in.
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setToken, getMe, setCurrentUser } from "../api";

const GOLD = "#F59E0B";
const DARK = "#050D1F";
const DARKER = "#030914";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error || !token) {
      setErr(
        error === "no_email"
          ? "Your account doesn't have an accessible email address. Please register manually."
          : "OAuth sign-in failed. Please try again or use email/password."
      );
      return;
    }

    setToken(token);

    // Fetch full user data now that the token is stored
    getMe()
      .then((res) => {
        const user = res?.user ?? res;
        setCurrentUser(user);
        navigate(user?.profile_complete === true ? "/app" : "/setup", { replace: true });
      })
      .catch(() => {
        // Token stored but /me failed — let ProtectedRoute handle it
        navigate("/app", { replace: true });
      });
  }, []); // eslint-disable-line

  if (err) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: `linear-gradient(160deg, ${DARKER} 0%, #071020 50%, #0F2D5E 100%)`,
        padding: 24, textAlign: "center",
      }}>
        <div style={{
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 12, padding: "20px 28px",
          color: "#F87171", maxWidth: 380,
          marginBottom: 24, fontSize: "0.95rem", lineHeight: 1.6,
        }}>
          {err}
        </div>
        <button
          onClick={() => navigate("/login", { replace: true })}
          style={{
            background: GOLD, color: DARK, border: "none",
            padding: "12px 28px", borderRadius: 10,
            fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: `linear-gradient(160deg, ${DARKER} 0%, #071020 50%, #0F2D5E 100%)`,
      gap: 16,
    }}>
      <div style={{
        width: 40, height: 40,
        border: `3px solid rgba(245,158,11,0.2)`,
        borderTop: `3px solid ${GOLD}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", margin: 0 }}>
        Signing you in…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
