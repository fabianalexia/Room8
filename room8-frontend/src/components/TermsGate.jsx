// Shown once to anyone who hasn't accepted the Terms yet (e.g. Google/LinkedIn signups).
import React, { useState } from "react";
import { acceptTerms, getCurrentUser, setCurrentUser } from "../api";


export default function TermsGate({ onAccepted }) {
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const accept = async () => {
    setBusy(true); setErr("");
    try {
      const r = await acceptTerms();
      const cur = getCurrentUser();
      if (cur) setCurrentUser({ ...cur, ...r.user });
      onAccepted(r.user);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="r8-card" style={{ maxWidth: 420, width: "100%", borderRadius: 28, padding: "30px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.04em" }}>Before you start</h1>
        <p className="r8-muted" style={{ fontSize: 15, lineHeight: 1.6 }}>
          Room8 has zero tolerance for harassment, hate speech, threats, or sexual content. You can report or block anyone, and we review every report within 24 hours. Accounts that break the rules are removed.
        </p>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15, lineHeight: 1.5, cursor: "pointer" }} className="r8-muted">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 20, height: 20, marginTop: 1, flexShrink: 0, accentColor: "#111112" }} />
          <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer" style={{ color: "var(--text)", fontWeight: 600 }}>Terms of Service</a> and <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: "var(--text)", fontWeight: 600 }}>Privacy Policy</a>.</span>
        </label>
        {err && <div className="r8-error">{err}</div>}
        <button disabled={!agree || busy} onClick={accept} className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block">
          {busy ? "Saving" : "Agree and continue"}
        </button>
      </div>
    </div>
  );
}
