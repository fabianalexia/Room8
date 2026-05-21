// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login as apiLogin, setCurrentUser, setToken, getToken, API_URL } from "../api";
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
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified") === "true";

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
      console.log("[login] response:", res);

      // Explicitly store the token (api.js also does this, belt-and-suspenders)
      if (res?.access_token) {
        setToken(res.access_token);
      }
      console.log("[login] token in localStorage:", getToken());

      if (!res?.user) {
        throw new Error("No user in login response");
      }

      setCurrentUser(res.user);
      const dest = res.user.profile_complete === false ? "/setup" : "/app";
      console.log("[login] navigating to:", dest);
      navigate(dest, { replace: true });
    } catch (error) {
      console.error("[login] error:", error);
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
        {/* Email verified banner */}
        {verified && (
          <div style={{
            background: "rgba(134,239,172,0.12)",
            border: "1px solid rgba(134,239,172,0.35)",
            borderRadius: 10, padding: "11px 16px",
            color: "#86efac", fontSize: "0.88rem",
            marginBottom: 20, fontFamily: BF,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>✓</span> Email verified! You can now sign in.
          </div>
        )}

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

          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password" name="password" value={form.password}
              onChange={update} placeholder="••••••••"
              required style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <Link to="/forgot-password" style={{
              color: MUTED, fontSize: "0.8rem", textDecoration: "none", fontFamily: BF,
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
            >
              Forgot password?
            </Link>
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

        <>
        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 18px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ color: MUTED, fontSize: "0.75rem", fontFamily: BF, whiteSpace: "nowrap" }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* OAuth buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => { window.location.href = `${API_URL}/api/auth/google`; }}
            style={{
              width: "100%", padding: "12px 16px",
              background: "#FFFFFF", color: "#1f1f1f",
              border: "1.5px solid rgba(255,255,255,0.15)",
              borderRadius: 10, fontWeight: 600, fontSize: "0.9rem",
              cursor: "pointer", fontFamily: BF,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => { window.location.href = `${API_URL}/api/auth/linkedin`; }}
            style={{
              width: "100%", padding: "12px 16px",
              background: "#0A66C2", color: "#FFFFFF",
              border: "none",
              borderRadius: 10, fontWeight: 600, fontSize: "0.9rem",
              cursor: "pointer", fontFamily: BF,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </button>
        </div>
        </>

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
