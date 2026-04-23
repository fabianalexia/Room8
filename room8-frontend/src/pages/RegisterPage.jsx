// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, setCurrentUser } from "../api";
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

function isSchoolEmail(email) {
  return /\.edu($|@)/i.test(email) || /\.(ac|edu)\.[a-z]{2}$/i.test(email);
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "", last_name: "",
    email: "", password: "", confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirm_password) { setErr("Passwords do not match."); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await register({
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        password:   form.password,
      });
      setCurrentUser(res.user);
      navigate("/setup", { replace: true });
    } catch (e) {
      setErr(e?.message || "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showEduHint    = form.email.includes("@") && !isSchoolEmail(form.email);
  const showEduSuccess = form.email.includes("@") && isSchoolEmail(form.email);
  const pwMismatch     = form.confirm_password && form.password !== form.confirm_password;

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DARKER} 0%, #071020 50%, ${NAVY} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
    }}>
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
        padding: "44px 44px",
        width: "100%",
        maxWidth: 460,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        position: "relative",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src={logoImg} alt="Room8"
            style={{ height: 40, marginBottom: 16, filter: "brightness(0) invert(1)", opacity: 0.9 }}
          />
          <h2 style={{
            fontFamily: HF, fontWeight: 800,
            fontSize: "1.55rem", color: WHITE,
            margin: "0 0 8px", letterSpacing: "-0.025em",
          }}>
            Create your account
          </h2>
          <p style={{ color: MUTED, margin: 0, fontSize: "0.9rem", fontFamily: BF }}>
            Find your perfect roommate — free
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

        <form onSubmit={submit}>
          {/* Name row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>First name</label>
              <input name="first_name" value={form.first_name} onChange={update}
                placeholder="Emma" required style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
            </div>
            <div>
              <label style={labelStyle}>Last name</label>
              <input name="last_name" value={form.last_name} onChange={update}
                placeholder="Chen" required style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              Email address
              <span style={{
                marginLeft: 8, fontSize: "0.68rem", fontWeight: 700,
                color: "rgba(245,158,11,0.8)",
                padding: "2px 8px", borderRadius: 6,
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}>
                .edu recommended
              </span>
            </label>
            <input type="email" name="email" value={form.email} onChange={update}
              placeholder="you@university.edu" required style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
            {showEduHint && (
              <p style={{ marginTop: 5, fontSize: "0.77rem", color: MUTED, fontFamily: BF }}>
                A .edu email unlocks campus-specific matching. Any email works too.
              </p>
            )}
            {showEduSuccess && (
              <p style={{ marginTop: 5, fontSize: "0.77rem", color: "#86efac", fontFamily: BF }}>
                ✓ School email detected — you'll see students from your campus
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" name="password" value={form.password} onChange={update}
              placeholder="Min 6 characters" required style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>

          <div style={{ marginBottom: 26 }}>
            <label style={labelStyle}>Confirm password</label>
            <input type="password" name="confirm_password" value={form.confirm_password}
              onChange={update} placeholder="Re-enter password" required
              style={{
                ...inputStyle,
                borderColor: pwMismatch ? "rgba(239,68,68,0.6)" : BORDER,
              }}
              onFocus={(e) => { e.target.style.borderColor = pwMismatch ? "rgba(239,68,68,0.6)" : "rgba(245,158,11,0.6)"; }}
              onBlur={(e) => { e.target.style.borderColor = pwMismatch ? "rgba(239,68,68,0.6)" : BORDER; }}
            />
            {pwMismatch && (
              <p style={{ marginTop: 5, fontSize: "0.77rem", color: "#F87171", fontFamily: BF }}>
                Passwords don't match
              </p>
            )}
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
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 22, fontSize: "0.88rem", color: MUTED, fontFamily: BF }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: GOLD, fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>

        <p style={{ textAlign: "center", marginTop: 10, fontSize: "0.7rem", color: "rgba(255,255,255,0.18)", lineHeight: 1.5, fontFamily: BF }}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
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
