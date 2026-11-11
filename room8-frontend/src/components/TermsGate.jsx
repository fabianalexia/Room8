// Shown once to anyone who hasn't accepted the Terms yet (e.g. Google/LinkedIn signups).
import React, { useState } from "react";
import { acceptTerms, getCurrentUser, setCurrentUser } from "../api";

const GOLD = "#f5a623";
const DARK = "#03040b";
const MUTED = "rgba(255,255,255,0.6)";
const JAKARTA = "'Plus Jakarta Sans', 'Inter', sans-serif";

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
    <div style={{ minHeight: "100dvh", background: DARK, color: "#fff", fontFamily: JAKARTA, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }}>
      <div style={{ maxWidth: 420, width: "100%", background: "linear-gradient(160deg,#0d1e3e,#08142a 45%,#050c1a)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: "26px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800 }}>Before you start</h1>
        <p style={{ margin: 0, color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
          Room8 has zero tolerance for harassment, hate speech, threats, or sexual content. You can report or block anyone, and we review every report within 24 hours. Accounts that break the rules are removed.
        </p>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: MUTED, lineHeight: 1.5, cursor: "pointer" }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
          <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer" style={{ color: GOLD }}>Terms of Service</a> and <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: GOLD }}>Privacy Policy</a>.</span>
        </label>
        {err && <div style={{ color: "#fca5a5", fontSize: 13 }}>{err}</div>}
        <button disabled={!agree || busy} onClick={accept} style={{ background: GOLD, color: DARK, border: "none", borderRadius: 12, padding: "14px 18px", fontWeight: 800, fontSize: "1rem", cursor: "pointer", opacity: !agree || busy ? 0.5 : 1, fontFamily: JAKARTA }}>
          {busy ? "Saving…" : "Agree and continue"}
        </button>
      </div>
    </div>
  );
}
