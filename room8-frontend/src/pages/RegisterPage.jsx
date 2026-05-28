// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, login, setCurrentUser, setToken } from "../api";
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [slowMsg, setSlowMsg] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setSlowMsg(true), 5000);
    else setSlowMsg(false);
    return () => clearTimeout(t);
  }, [loading]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!agreedToTerms) { setErr("You must agree to the Terms of Service and Privacy Policy to create an account."); return; }
    if (form.password !== form.confirm_password) { setErr("Passwords do not match."); return; }
    if (form.password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await register({
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        password:   form.password,
      });
      // JWT is in an httpOnly cookie set by the server — only store display info locally
      setCurrentUser(res.user);
      navigate("/setup", { replace: true });
    } catch (e) {
      const msg = e?.message || "";
      const isNetworkErr = msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network");
      const isAlreadyExists = msg.toLowerCase().includes("already exists");

      if (isNetworkErr || isAlreadyExists) {
        // Account may have been created — try logging in automatically
        try {
          const loginRes = await login({ email: form.email, password: form.password });
          if (loginRes?.access_token) setToken(loginRes.access_token);
          if (loginRes?.user) {
            setCurrentUser(loginRes.user);
            navigate(loginRes.user.profile_complete === false ? "/setup" : "/app", { replace: true });
            return;
          }
        } catch {
          // Login also failed — server still waking up
        }
        setErr(isAlreadyExists
          ? "Looks like your account was already created! Try signing in instead."
          : "Our server is waking up — please wait 30 seconds and try again."
        );
      } else {
        setErr(msg || "Could not create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const hasAt          = form.email.includes("@");
  const showEduSuccess = hasAt && isSchoolEmail(form.email);
  const showCommunity  = hasAt && !isSchoolEmail(form.email);
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
            {err.includes("already created") && (
              <> <Link to="/login" style={{ color: GOLD, fontWeight: 700, textDecoration: "none" }}>Sign in →</Link></>
            )}
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
            <label style={labelStyle}>Email address</label>
            <input type="email" name="email" value={form.email} onChange={update}
              placeholder="you@university.edu or you@gmail.com" required style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
            {showEduSuccess && (
              <div style={{
                marginTop: 6, padding: "7px 10px", borderRadius: 8,
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.25)",
                display: "flex", alignItems: "flex-start", gap: 7,
              }}>
                <span style={{ fontSize: "0.8rem", lineHeight: 1.4, color: "#F5A623", fontWeight: 700 }}>✓ Verified Student</span>
                <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.4, fontFamily: BF }}>
                  — your school email qualifies you as a Verified Student
                </span>
              </div>
            )}
            {showCommunity && (
              <div style={{
                marginTop: 6, padding: "7px 10px", borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "flex-start", gap: 7,
              }}>
                <span style={{ fontSize: "0.8rem", lineHeight: 1.4, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Community Member</span>
                <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.4, fontFamily: BF }}>
                  — you can browse and match with students
                </span>
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" name="password" value={form.password} onChange={update}
              placeholder="Min 8 characters" required style={inputStyle}
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

          {/* Terms & Privacy checkbox */}
          <label style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            marginBottom: 20, cursor: "pointer",
          }}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ marginTop: 3, accentColor: GOLD, width: 15, height: 15, flexShrink: 0, cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.6)", fontFamily: BF, lineHeight: 1.5 }}>
              I agree to the{" "}
              <Link to="/terms" target="_blank" style={{ color: GOLD, fontWeight: 600, textDecoration: "none" }}>
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link to="/privacy" target="_blank" style={{ color: GOLD, fontWeight: 600, textDecoration: "none" }}>
                Privacy Policy
              </Link>
            </span>
          </label>

          <style>{`@keyframes r8spin{to{transform:rotate(360deg)}}`}</style>
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
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
          >
            {loading && (
              <span style={{
                width: 16, height: 16, borderRadius: "50%",
                border: "2px solid rgba(5,13,31,0.3)",
                borderTopColor: "rgba(5,13,31,0.7)",
                animation: "r8spin 0.7s linear infinite",
                display: "inline-block", flexShrink: 0,
              }} />
            )}
            {loading ? "Creating account…" : "Create Account →"}
          </button>
          {slowMsg && (
            <p style={{ textAlign: "center", marginTop: 12, fontSize: "0.78rem", color: MUTED, fontFamily: BF }}>
              Taking a moment — our server may be starting up. Hang tight!
            </p>
          )}
        </form>

        <>
        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 18px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ color: MUTED, fontSize: "0.75rem", fontFamily: BF, whiteSpace: "nowrap" }}>or sign up with</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* OAuth buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => { window.location.href = "https://room8-4dq7.onrender.com/api/auth/google"; }}
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
            onClick={() => { window.location.href = "https://room8-4dq7.onrender.com/api/auth/linkedin"; }}
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

        <p style={{ textAlign: "center", marginTop: 22, fontSize: "0.88rem", color: MUTED, fontFamily: BF }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: GOLD, fontWeight: 700, textDecoration: "none" }}>
            Sign in
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
