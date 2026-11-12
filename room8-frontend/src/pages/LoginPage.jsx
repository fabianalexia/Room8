// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login as apiLogin, setCurrentUser, setToken } from "../api";
import { startOAuth } from "../oauth";
import AuthShell, { OAuthButtons, OrDivider, PasswordInput } from "../components/AuthShell";
import Icon from "../ui/Icon";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified") === "true";

  const [form, setForm]     = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const oauthError = searchParams.get("oauth_error");
  const [err, setErr]       = useState(oauthError ? "Google or LinkedIn sign-in didn't finish. Please try again." : "");
  const [slowMsg, setSlowMsg] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setSlowMsg(true), 5000);
    else setSlowMsg(false);
    return () => clearTimeout(t);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await apiLogin(form);

      // Explicitly store the token (api.js also does this, belt-and-suspenders)
      if (res?.access_token) {
        setToken(res.access_token);
      }

      if (!res?.user) {
        throw new Error("No user in login response");
      }

      setCurrentUser(res.user);
      const dest = res.user.profile_complete === false ? "/setup" : "/app";
      navigate(dest, { replace: true });
    } catch (error) {
      console.error("[login] error:", error);
      const msg = (error.message || "").toLowerCase();
      const status = error.status || error.statusCode;
      let errMsg;
      if (msg.includes("verify")) {
        errMsg = "Please verify your email before logging in.";
      } else if (msg.includes("invalid") || msg.includes("incorrect") || status === 401) {
        errMsg = "Wrong password. Please try again.";
      } else if (msg.includes("not found") || msg.includes("no account") || status === 404) {
        errMsg = "No account found with that email.";
      } else if (msg.includes("fetch") || msg.includes("network") || msg.includes("waking")) {
        errMsg = "Our server is waking up. Give it 30 seconds and try again.";
      } else {
        errMsg = "Login failed. Please try again.";
      }
      setErr(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" sub="Log in to see who's looking for a roommate."
      banner={verified ? <div className="r8-success" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Icon name="check" size={18} stroke={2.4} />Email verified. You can log in now.</div> : null}
      footer={<>New here? <Link to="/register" style={{ color: "var(--text)", fontWeight: 600 }}>Create an account</Link></>}>
      <OAuthButtons onGoogle={() => startOAuth("google")} onLinkedIn={() => startOAuth("linkedin")} />
      <OrDivider />
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {err && <div className="r8-error" role="alert">{err}</div>}
        <div className="r8-field">
          <label className="r8-label" htmlFor="li-email">Email</label>
          <input id="li-email" className="r8-input" type="email" name="email" value={form.email} onChange={update} placeholder="you@school.edu" autoComplete="email" required />
        </div>
        <div className="r8-field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label className="r8-label" htmlFor="li-pass">Password</label>
            <Link to="/forgot-password" style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", textDecoration: "underline" }}>Forgot?</Link>
          </div>
          <PasswordInput id="li-pass" value={form.password} onChange={update} />
        </div>
        <button type="submit" className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? <><span className="r8-spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: "#0E0F12" }} />Logging in</> : "Log in"}
        </button>
        {slowMsg && <p className="r8-faint" style={{ fontSize: 13, textAlign: "center" }}>Waking up the server, this can take up to 30 seconds the first time.</p>}
      </form>
    </AuthShell>
  );
}
