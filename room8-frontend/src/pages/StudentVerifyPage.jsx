// Prove you're a student: enter a .edu email, get a 6-digit code, type it in.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, sendEduCode, confirmEduCode } from "../api";

const GOLD = "#f5a623";
const GOLD2 = "#f5c842";
const DARK = "#03040b";
const WHITE = "#ffffff";
const MUTED = "rgba(255,255,255,0.55)";
const JAKARTA = "'Plus Jakarta Sans', 'Inter', sans-serif";

export default function StudentVerifyPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const startEmail = user?.email?.toLowerCase().endsWith(".edu") ? user.email : "";

  const [step, setStep] = useState(user?.edu_verified ? "done" : "email");
  const [email, setEmail] = useState(startEmail);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const send = async (e) => {
    e?.preventDefault();
    setErr(""); setInfo(""); setBusy(true);
    try {
      const r = await sendEduCode(email.trim());
      setStep("code");
      setInfo(`We sent a 6-digit code to ${r.sent_to}. Check spam if you don't see it.`);
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  const confirm = async (e) => {
    e?.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await confirmEduCode(code.trim());
      if (r?.user && user) setCurrentUser({ ...user, ...r.user });
      setStep("done");
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "100dvh", background: DARK, color: WHITE, fontFamily: JAKARTA, padding: "calc(env(safe-area-inset-top,0px) + 20px) 20px 120px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ alignSelf: "flex-start", background: "none", border: "none", color: MUTED, fontSize: 14, cursor: "pointer", padding: 0 }}>← Back</button>
        <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>Verify you're a student</h1>

        <div style={card}>
          {step === "email" && (
            <form onSubmit={send} style={form}>
              <p style={muted}>Enter your school email. We'll send a code to prove it's yours. Verified students count toward unlocking your campus.</p>
              <input type="email" inputMode="email" autoComplete="email" placeholder="you@school.edu" value={email}
                onChange={(e) => setEmail(e.target.value)} style={input} required />
              <button type="submit" disabled={busy || !email.trim()} style={{ ...btn, opacity: busy || !email.trim() ? 0.6 : 1 }}>
                {busy ? "Sending…" : "Send code"}
              </button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={confirm} style={form}>
              {info && <p style={muted}>{info}</p>}
              <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                style={{ ...input, textAlign: "center", fontSize: 28, letterSpacing: 10, fontWeight: 800 }} required />
              <button type="submit" disabled={busy || code.length !== 6} style={{ ...btn, opacity: busy || code.length !== 6 ? 0.6 : 1 }}>
                {busy ? "Checking…" : "Verify"}
              </button>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="button" style={link} onClick={() => { setStep("email"); setCode(""); setErr(""); }}>Change email</button>
                <button type="button" style={link} disabled={busy} onClick={send}>Resend code</button>
              </div>
            </form>
          )}

          {step === "done" && (
            <div style={form}>
              <div style={{ fontSize: 48 }}>🎓</div>
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>You're a verified student</h2>
              <p style={muted}>You now count toward unlocking {user?.school || "your school"}.</p>
              <button style={btn} onClick={() => navigate("/app")}>Back to Room8</button>
            </div>
          )}

          {err && <div style={errBox}>{err}</div>}
        </div>
      </div>
    </div>
  );
}

const card = { padding: "24px 20px", borderRadius: 24, background: "linear-gradient(160deg,#0d1e3e,#08142a 45%,#050c1a)", border: "1px solid rgba(255,255,255,.08)", textAlign: "center" };
const form = { display: "flex", flexDirection: "column", gap: 14, alignItems: "stretch" };
const muted = { margin: 0, color: MUTED, fontSize: 14, lineHeight: 1.55 };
const input = { background: DARK, color: WHITE, border: "1px solid rgba(255,255,255,.18)", borderRadius: 12, padding: "14px 16px", fontSize: 16, fontFamily: JAKARTA, outline: "none" };
const btn = { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: DARK, border: "none", padding: "14px 20px", borderRadius: 12, fontWeight: 800, fontSize: "1rem", cursor: "pointer", fontFamily: JAKARTA };
const link = { background: "none", border: "none", color: GOLD, fontSize: 13, cursor: "pointer", textDecoration: "underline", fontFamily: JAKARTA };
const errBox = { marginTop: 14, background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.35)", color: "#fca5a5", borderRadius: 12, padding: "10px 14px", fontSize: 13 };
