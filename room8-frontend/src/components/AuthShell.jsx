// Frame for login, signup and password screens. Brand panel on desktop, focused form on phones.
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mark, Wordmark } from "../ui/Logo";
import Icon from "../ui/Icon";

export default function AuthShell({ title, sub, children, footer, banner }) {
  return (
    <div className="r8-page r8-auth" style={{ position: "relative", overflow: "hidden", display: "grid", gridTemplateColumns: "minmax(0, 1fr)" }}>
      <style>{`
        @media (min-width: 960px) { .r8-auth { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr) !important; } .r8-auth__brand { display: flex !important; } .r8-auth__mlogo { display: none !important; } }
      `}</style>
      <aside className="r8-auth__brand" aria-hidden="true" style={{ display: "none", position: "relative", overflow: "hidden", padding: 44, flexDirection: "column", justifyContent: "space-between", color: "#fff", background: "#1a1a1c" }}>
        <img src="/brand/duo.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "45% 30%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(17,17,18,.35), rgba(17,17,18,.05) 30%, rgba(17,17,18,.75))" }} />
        <Link to="/" style={{ position: "relative" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Mark size={42} surface="#2a2a2c" people="#fff" /><Wordmark size={30} color="#fff" /></span></Link>
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 24, marginBottom: 24, background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.22)", WebkitBackdropFilter: "blur(24px) saturate(160%)", backdropFilter: "blur(24px) saturate(160%)" }}>
            <span className="r8-match-pill" style={{ height: 38, fontSize: 18 }}>98%</span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>Similar schedules, clean, social balance</span>
          </div>
          <p style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 46, lineHeight: 1, letterSpacing: "-0.045em", maxWidth: 460 }}>Find a roommate who just gets it.</p>
          <p style={{ marginTop: 14, color: "rgba(255,255,255,.8)", fontSize: 16, maxWidth: 400 }}>Verified students from your campus, matched on how you really live.</p>
        </div>
      </aside>

      <main style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(var(--safe-t) + 32px) 20px calc(var(--safe-b) + 32px)", minHeight: "100dvh" }}>
        <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 380, height: 380, top: -200, right: -180 }} />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 28 }} style={{ position: "relative", width: "100%", maxWidth: 420 }}>
          <Link to="/" aria-label="Room8 home" className="r8-auth__mlogo" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Mark size={42} /><Wordmark size={30} /></span>
          </Link>
          {banner}
          <h1 style={{ fontSize: "clamp(32px, 8vw, 40px)", marginBottom: 8 }}>{title}</h1>
          {sub && <p className="r8-muted" style={{ fontSize: 16, marginBottom: 28 }}>{sub}</p>}
          {children}
          {footer && <div style={{ marginTop: 28, textAlign: "center", fontSize: 15 }} className="r8-muted">{footer}</div>}
        </motion.div>
      </main>
    </div>
  );
}

export function OAuthButtons({ onGoogle, onLinkedIn }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button type="button" className="r8-btn r8-btn--glass r8-btn--block" onClick={onGoogle}><Icon name="google" size={20} />Continue with Google</button>
      <button type="button" className="r8-btn r8-btn--glass r8-btn--block" onClick={onLinkedIn}><Icon name="linkedin" size={20} />Continue with LinkedIn</button>
    </div>
  );
}

export function OrDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }} aria-hidden="true">
      <span style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
      <span className="r8-faint" style={{ fontSize: 13 }}>or</span>
      <span style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
    </div>
  );
}

export function PasswordInput({ id, value, onChange, name = "password", placeholder = "Password", autoComplete = "current-password" }) {
  const [show, setShow] = React.useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input id={id} className="r8-input" type={show ? "text" : "password"} name={name} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} required style={{ paddingRight: 52 }} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} style={{ position: "absolute", right: 6, top: 6, width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>
        <Icon name={show ? "eyeOff" : "eye"} size={19} />
      </button>
    </div>
  );
}
