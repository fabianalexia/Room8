// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as apiLogin, setCurrentUser } from "../api";
import logoImg from "../assets/images/logo.png";

const NAVY  = "#0F2D5E";
const GOLD  = "#F59E0B";
const DARK  = "#050D1F";
const DARKER = "#030914";
const WHITE = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.45)";
const BORDER = "rgba(255,255,255,0.1)";
const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await apiLogin(form);
      setCurrentUser(res.user);
      navigate(res.user.profile_complete === false ? "/profile/setup" : "/app", { replace: true });
    } catch (error) {
      setErr(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DARKER} 0%, #071020 50%, ${NAVY} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: "fixed", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />

      <div style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 20,
        padding: "48px 44px",
        width: "100%",
        maxWidth: 420,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        position: "relative",
      }}>
        {/* Logo + heading */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img
            src={logoImg} alt="Room8"
            style={{ height: 40, marginBottom: 16, filter: "brightness(0) invert(1)", opacity: 0.9 }}
          />
          <h2 style={{
            fontFamily: HF, fontWeight: 800,
            fontSize: "1.55rem", color: WHITE,
            margin: "0 0 8px", letterSpacing: "-0.025em",
          }}>
            Welcome back
          </h2>
          <p style={{ color: MUTED, margin: 0, fontSize: "0.9rem", fontFamily: BF }}>
            Sign in to your Room8 account
          </p>
        </div>

        {err && (
          <div style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            padding: "11px 16px",
            color: "#F87171",
            fontSize: "0.88rem",
            marginBottom: 20,
            fontFamily: BF,
          }}>
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email" name="email" value={form.email}
              onChange={update} placeholder="you@university.edu"
              required autoFocus style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password" name="password" value={form.password}
              onChange={update} placeholder="••••••••"
              required style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px",
            background: loading ? "rgba(245,158,11,0.5)" : GOLD,
            color: loading ? "rgba(5,13,31,0.5)" : DARK,
            border: "none",
            borderRadius: 10, fontWeight: 800, fontSize: "0.95rem",
            cursor: loading ? "default" : "pointer",
            fontFamily: HF,
            boxShadow: loading ? "none" : "0 6px 28px rgba(245,158,11,0.4)",
            transition: "all 0.15s",
          }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.88rem", color: MUTED, fontFamily: BF }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: GOLD, fontWeight: 700, textDecoration: "none" }}>
            Sign up free
          </Link>
        </p>

        <p style={{ textAlign: "center", marginTop: 12, fontSize: "0.88rem", fontFamily: BF }}>
          <Link to="/" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none", fontSize: "0.78rem" }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 7,
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "rgba(255,255,255,0.55)",
  fontFamily: "'Inter', sans-serif",
  letterSpacing: "0.04em",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "inherit",
  background: "rgba(255,255,255,0.06)",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  color: "#FFFFFF",
};
