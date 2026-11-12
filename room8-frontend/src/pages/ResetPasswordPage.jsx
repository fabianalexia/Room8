// src/pages/ResetPasswordPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api";
import AuthShell, { PasswordInput } from "../components/AuthShell";
import Icon from "../ui/Icon";
import { EmptyState } from "../ui/kit";

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
    <AuthShell title={done ? "" : "Choose a new password"} sub={done ? "" : "At least 8 characters. Make it a good one."}
      footer={<Link to="/login" style={{ color: "var(--text)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="back" size={16} />Back to log in</Link>}>
      {done ? (
        <div className="r8-card"><EmptyState icon="check" title="Password updated" body="Taking you to log in..." /></div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {err && <div className="r8-error" role="alert">{err}</div>}
          <div className="r8-field"><label className="r8-label" htmlFor="rp-pass">New password</label><PasswordInput id="rp-pass" value={form.password} onChange={update} placeholder="At least 8 characters" autoComplete="new-password" /></div>
          <div className="r8-field">
            <label className="r8-label" htmlFor="rp-pass2">Confirm password</label>
            <PasswordInput id="rp-pass2" name="confirm" value={form.confirm} onChange={update} placeholder="Type it again" autoComplete="new-password" />
            {pwMismatch && <span style={{ fontSize: 13.5, color: "var(--danger)" }}>Passwords don't match yet.</span>}
          </div>
          <button type="submit" className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={loading}>{loading ? "Saving..." : "Update password"}</button>
        </form>
      )}
    </AuthShell>
  );
}
