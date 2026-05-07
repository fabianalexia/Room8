// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api";
import logoImg from "../assets/images/logo.png";

const NAVY   = "#0F2D5E";
const GOLD   = "#F59E0B";
const DARK   = "#050D1F";
const DARKER = "#030914";
const WHITE  = "#FFFFFF";
const MUTED  = "rgba(255,255,255,0.45)";
const BORDER = "rgba(255,255,255,0.1)";
const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [err,     setErr]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e) {
      setErr(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DARKER} 0%, #071020 50%, ${NAVY} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        position: "fixed", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />

      <div style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderRadius: 20, padding: "48px 44px",
        width: "100%", maxWidth: 420,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        position: "relative",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={logoImg} alt="Room8"
            style={{ height: 40, marginBottom: 16, filter: "brightness(0) invert(1)", opacity: 0.9 }}
          />
          <h2 style={{
            fontFamily: HF, fontWeight: 800, fontSize: "1.55rem",
            color: WHITE, margin: "0 0 8px", letterSpacing: "-0.025em",
          }}>
            Reset your password
          </h2>
          <p style={{ color: MUTED, margin: 0, fontSize: "0.9rem", fontFamily: BF }}>
            We'll send a reset link to your email.
          </p>
        </div>

        {sent ? (
          <div style={{
            background: "rgba(134,239,172,0.1)",
            border: "1px solid rgba(134,239,172,0.3)",
            borderRadius: 12, padding: "24px 20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📬</div>
            <p style={{ color: "#86efac", fontWeight: 700, margin: "0 0 6px", fontFamily: HF }}>
              Check your inbox
            </p>
            <p style={{ color: MUTED, fontSize: "0.88rem", margin: 0, fontFamily: BF }}>
              If an account exists for <strong style={{ color: WHITE }}>{email}</strong>,
              you'll receive a reset link shortly.
            </p>
          </div>
        ) : (
          <>
            {err && (
              <div style={{
                background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "11px 16px",
                color: "#F87171", fontSize: "0.88rem", marginBottom: 20, fontFamily: BF,
              }}>
                {err}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu" required autoFocus
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(245,158,11,0.5)" : GOLD,
                color: loading ? "rgba(5,13,31,0.5)" : DARK,
                border: "none", borderRadius: 10,
                fontWeight: 800, fontSize: "0.95rem",
                cursor: loading ? "default" : "pointer",
                fontFamily: HF,
                boxShadow: loading ? "none" : "0 6px 28px rgba(245,158,11,0.4)",
                transition: "all 0.15s",
              }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.88rem", fontFamily: BF }}>
          <Link to="/login" style={{ color: MUTED, textDecoration: "none", fontSize: "0.82rem" }}>
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", marginBottom: 7,
  fontSize: "0.8rem", fontWeight: 600,
  color: "rgba(255,255,255,0.55)", fontFamily: BF, letterSpacing: "0.04em",
};

const inputStyle = {
  width: "100%", padding: "12px 14px",
  border: "1.5px solid rgba(255,255,255,0.1)",
  borderRadius: 10, fontSize: "0.95rem", outline: "none",
  fontFamily: "inherit", background: "rgba(255,255,255,0.06)",
  boxSizing: "border-box", transition: "border-color 0.2s", color: "#FFFFFF",
};
