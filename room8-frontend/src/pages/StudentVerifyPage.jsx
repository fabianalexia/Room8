// Prove you're a student: enter a .edu email, get a 6-digit code, type it in.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, sendEduCode, confirmEduCode } from "../api";
import OnboardShell from "../components/OnboardShell";
import Icon from "../ui/Icon";
import { EmptyState } from "../ui/kit";

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
    <OnboardShell label="Student verification" onBack={() => navigate(-1)} title={step === "done" ? "" : "Verify you're a student"}
      sub={step === "email" ? "Enter your school email and we'll send a 6-digit code. Verified students help unlock your campus." : step === "code" ? info : ""} error={err}>
      {step === "email" && (
        <form onSubmit={send} className="r8-card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="r8-label" htmlFor="sv-email">School email</label>
          <div style={{ position: "relative" }}>
            <Icon name="mail" size={19} color="var(--text-3)" style={{ position: "absolute", left: 16, top: 16 }} />
            <input id="sv-email" className="r8-input" style={{ paddingLeft: 46 }} type="email" inputMode="email" autoComplete="email" placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={busy || !email.trim()}>{busy ? "Sending..." : "Send code"}</button>
        </form>
      )}
      {step === "code" && (
        <form onSubmit={confirm} className="r8-card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="r8-label" htmlFor="sv-code">6-digit code</label>
          <input id="sv-code" className="r8-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required
            style={{ textAlign: "center", fontSize: 32, letterSpacing: "0.4em", fontWeight: 700, fontFamily: "var(--display)", minHeight: 72 }} />
          <button type="submit" className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={busy || code.length !== 6}>{busy ? "Checking..." : "Verify"}</button>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button type="button" className="r8-btn r8-btn--ghost r8-btn--sm" onClick={() => { setStep("email"); setCode(""); setErr(""); }}>Change email</button>
            <button type="button" className="r8-btn r8-btn--ghost r8-btn--sm" disabled={busy} onClick={send}><Icon name="refresh" size={15} />Resend code</button>
          </div>
        </form>
      )}
      {step === "done" && (
        <div className="r8-card">
          <EmptyState icon="school" title="You're a verified student" body={`You now count toward unlocking ${user?.school || "your school"}.`}
            action={<button className="r8-btn r8-btn--primary" onClick={() => navigate("/app")}>Back to Room8</button>} />
        </div>
      )}
    </OnboardShell>
  );
}
