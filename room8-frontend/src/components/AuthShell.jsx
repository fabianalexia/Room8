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
      <aside className="r8-auth__brand" aria-hidden="true" style={{ display: "none", position: "relative", overflow: "hidden", padding: 48, flexDirection: "column", justifyContent: "space-between", background: "#0E0F12", color: "#F2F2F5" }}>
        <div className="r8-aura r8-aura--a" style={{ width: 560, height: 560, top: -160, right: -200, opacity: .55 }} />
        <div className="r8-aura r8-aura--b" style={{ width: 460, height: 460, bottom: -120, left: -160, opacity: .5 }} />
        <Link to="/" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 10 }}>
          <Mark size={40} surface="#0E0F12" people="#F2F2F5" /><Wordmark size={28} color="#F2F2F5" />
        </Link>
        <div style={{ position: "relative", height: 380 }}>
          {[{ r: -9, x: 30, y: 40, c: "#45D9FF" }, { r: 7, x: 200, y: 10, c: "#D98BFF" }, { r: -2, x: 112, y: 70, c: "#8C9EFF" }].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40, rotate: card.r * 2 }} animate={{ opacity: 1, y: [card.y, card.y - 10, card.y], rotate: card.r }}
              transition={{ opacity: { delay: 0.1 + i * 0.12 }, y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" }, rotate: { type: "spring", stiffness: 120, damping: 14, delay: 0.1 + i * 0.12 } }}
              style={{ position: "absolute", left: card.x, top: 0, width: 210, height: 290, borderRadius: 30, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 30px 60px rgba(0,0,0,.45)", overflow: "hidden" }}>
              <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: card.c, filter: "blur(60px)", opacity: .55, top: 20, left: 10 }} />
              <div style={{ position: "absolute", left: 18, right: 18, bottom: 18 }}>
                <div style={{ width: "60%", height: 12, borderRadius: 6, background: "rgba(255,255,255,.75)", marginBottom: 8 }} />
                <div style={{ width: "40%", height: 9, borderRadius: 5, background: "rgba(255,255,255,.35)" }} />
              </div>
              {i === 2 && <div className="r8-sticker" style={{ position: "absolute", top: 18, right: 16 }}><b>94%</b><small>MATCH</small></div>}
            </motion.div>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <p style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.035em", maxWidth: 440 }}>
            Find the roommate who <span className="r8-iri-text">actually gets you.</span>
          </p>
          <p style={{ marginTop: 14, color: "rgba(242,242,245,.65)", fontSize: 16, maxWidth: 400 }}>Verified students from your campus, matched on how you really live.</p>
        </div>
      </aside>

      <main style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(var(--safe-t) + 32px) 20px calc(var(--safe-b) + 32px)", minHeight: "100dvh" }}>
        <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 380, height: 380, top: -200, right: -180 }} />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 28 }} style={{ position: "relative", width: "100%", maxWidth: 420 }}>
          <Link to="/" aria-label="Room8 home" className="r8-auth__mlogo" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <Mark size={36} /><Wordmark size={24} />
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
