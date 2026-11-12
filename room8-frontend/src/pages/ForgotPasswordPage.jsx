// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api";
import AuthShell from "../components/AuthShell";
import Icon from "../ui/Icon";
import { EmptyState } from "../ui/kit";

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
    <AuthShell title={sent ? "" : "Forgot your password?"} sub={sent ? "" : "No stress. Enter your email and we'll send you a reset link."}
      footer={<Link to="/login" style={{ color: "var(--text)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="back" size={16} />Back to log in</Link>}>
      {sent ? (
        <div className="r8-card"><EmptyState icon="mail" title="Check your inbox" body={`If an account exists for ${email}, a reset link is on its way. It can take a minute, and check spam too.`} /></div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {err && <div className="r8-error" role="alert">{err}</div>}
          <div className="r8-field">
            <label className="r8-label" htmlFor="fp-email">Email</label>
            <input id="fp-email" className="r8-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" autoComplete="email" required />
          </div>
          <button type="submit" className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
        </form>
      )}
    </AuthShell>
  );
}
