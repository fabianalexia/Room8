// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { register, login, setCurrentUser, setToken } from "../api";
import { startOAuth } from "../oauth";
import AuthShell, { OAuthButtons, OrDivider, PasswordInput } from "../components/AuthShell";
import Icon from "../ui/Icon";

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
          ? "Looks like you already have an account. Try logging in."
          : "Our server is waking up. Give it 30 seconds and try again."
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
    <AuthShell title="Create your account" sub="Free for students. Takes about two minutes."
      footer={<>Already have an account? <Link to="/login" style={{ color: "var(--text)", fontWeight: 600 }}>Log in</Link></>}>
      <OAuthButtons onGoogle={() => startOAuth("google")} onLinkedIn={() => startOAuth("linkedin")} />
      <OrDivider />
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {err && <div className="r8-error" role="alert">{err}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          <div className="r8-field"><label className="r8-label" htmlFor="rg-first">First name</label><input id="rg-first" className="r8-input" name="first_name" value={form.first_name} onChange={update} autoComplete="given-name" required /></div>
          <div className="r8-field"><label className="r8-label" htmlFor="rg-last">Last name</label><input id="rg-last" className="r8-input" name="last_name" value={form.last_name} onChange={update} autoComplete="family-name" required /></div>
        </div>
        <div className="r8-field">
          <label className="r8-label" htmlFor="rg-email">Email</label>
          <input id="rg-email" className="r8-input" type="email" name="email" value={form.email} onChange={update} placeholder="you@school.edu" autoComplete="email" required />
          <AnimatePresence mode="wait">
            {showEduSuccess && <motion.span key="edu" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--success)" }}><Icon name="school" size={15} />School email. You'll get the verified student badge.</motion.span>}
            {showCommunity && <motion.span key="com" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="r8-help">Not a school email. You can still join, and verify your .edu later for the student badge.</motion.span>}
          </AnimatePresence>
        </div>
        <div className="r8-field">
          <label className="r8-label" htmlFor="rg-pass">Password</label>
          <PasswordInput id="rg-pass" value={form.password} onChange={update} placeholder="At least 8 characters" autoComplete="new-password" />
        </div>
        <div className="r8-field">
          <label className="r8-label" htmlFor="rg-pass2">Confirm password</label>
          <PasswordInput id="rg-pass2" name="confirm_password" value={form.confirm_password} onChange={update} placeholder="Type it again" autoComplete="new-password" />
          {pwMismatch && <span style={{ fontSize: 13.5, color: "var(--danger)" }}>Passwords don't match yet.</span>}
        </div>
        <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, color: "var(--text-2)", lineHeight: 1.5, cursor: "pointer", marginTop: 4 }}>
          <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ marginTop: 2, width: 20, height: 20, flexShrink: 0, accentColor: "#8C9EFF" }} />
          <span>I agree to the <Link to="/terms" style={{ color: "var(--text)", fontWeight: 600 }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: "var(--text)", fontWeight: 600 }}>Privacy Policy</Link>.</span>
        </label>
        <button type="submit" className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? <><span className="r8-spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: "#0E0F12" }} />Creating account</> : "Create account"}
        </button>
        {slowMsg && <p className="r8-faint" style={{ fontSize: 13, textAlign: "center" }}>Waking up the server, this can take up to 30 seconds the first time.</p>}
      </form>
    </AuthShell>
  );
}
