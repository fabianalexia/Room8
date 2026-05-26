// src/pages/ResetPasswordPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api";
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm]     = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const pwMismatch = form.confirm && form.password !== form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setErr("Passwords do not match."); return; }
    if (form.password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (!token) { setErr("Missing reset token. Please use the link from your email."); return; }

    setErr("");
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (e) {
      setErr(e?.message || "Reset failed. The link may have expired.");
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
            Choose a new password
          </h2>
          <p style={{ color: MUTED, margin: 0, fontSize: "0.9rem", fontFamily: BF }}>
            Must be at least 6 characters.
          </p>
        </div>

        {!token && (
          <div style={{
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10, padding: "14px 16px",
            color: "#F87171", fontSize: "0.88rem", marginBottom: 20, fontFamily: BF,
            textAlign: "center",
          }}>
            Invalid reset link. Please request a new one.
            <br />
            <Link to="/forgot-password" style={{ color: GOLD, fontWeight: 700 }}>
              Request new link →
            </Link>
          </div>
        )}

        {done ? (
          <div style={{
            background: "rgba(134,239,172,0.1)",
            border: "1px solid rgba(134,239,172,0.3)",
            borderRadius: 12, padding: "24px 20px", textAlign: "center",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
            <p style={{ color: "#86efac", fontWeight: 700, margin: "0 0 6px", fontFamily: HF }}>
              Password updated!
            </p>
            <p style={{ color: MUTED, fontSize: "0.88rem", margin: 0, fontFamily: BF }}>
              Redirecting you to sign in…
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
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>New password</label>
                <input
                  type="password" name="password" value={form.password}
                  onChange={update} placeholder="Min 6 characters"
                  required autoFocus style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Confirm new password</label>
                <input
                  type="password" name="confirm" value={form.confirm}
                  onChange={update} placeholder="Re-enter password"
                  required style={{
                    ...inputStyle,
                    borderColor: pwMismatch ? "rgba(239,68,68,0.6)" : BORDER,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = pwMismatch ? "rgba(239,68,68,0.6)" : "rgba(245,158,11,0.6)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = pwMismatch ? "rgba(239,68,68,0.6)" : BORDER;
                  }}
                />
                {pwMismatch && (
                  <p style={{ marginTop: 5, fontSize: "0.77rem", color: "#F87171", fontFamily: BF }}>
                    Passwords don't match
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading || !token} style={{
                width: "100%", padding: "14px",
                background: (loading || !token) ? "rgba(245,158,11,0.5)" : GOLD,
                color: (loading || !token) ? "rgba(5,13,31,0.5)" : DARK,
                border: "none", borderRadius: 10,
                fontWeight: 800, fontSize: "0.95rem",
                cursor: (loading || !token) ? "default" : "pointer",
                fontFamily: HF,
                boxShadow: (loading || !token) ? "none" : "0 6px 28px rgba(245,158,11,0.4)",
                transition: "all 0.15s",
              }}
                onMouseEnter={(e) => { if (!loading && token) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
              >
                {loading ? "Saving…" : "Set New Password"}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.82rem", fontFamily: BF }}>
          <Link to="/login" style={{ color: MUTED, textDecoration: "none" }}>
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
