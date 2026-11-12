// src/ui/kit.jsx: shared Room8 UI pieces built on theme.css
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./Icon";

export const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 };
export const softSpring = { type: "spring", stiffness: 260, damping: 28 };

export function initials(name = "") {
  return name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export function Avatar({ src, name, size = 44, ring = false, style }) {
  const [broken, setBroken] = React.useState(false);
  const inner = src && !broken
    ? <img src={src} alt={name || ""} onError={() => setBroken(true)} />
    : <span style={{ fontSize: Math.round(size * 0.36), fontFamily: "var(--display)" }}>{initials(name)}</span>;
  return (
    <span className={`r8-avatar${ring ? " r8-avatar--ring" : ""}`} style={{ width: size, height: size, ...style }}>
      {inner}
    </span>
  );
}

export function Aura({ style }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0, ...style }}>
      <div className="r8-aura r8-aura--a" style={{ width: 420, height: 420, top: -180, right: -160 }} />
      <div className="r8-aura r8-aura--b" style={{ width: 360, height: 360, top: 280, left: -200 }} />
    </div>
  );
}

export function TopBar({ title, left, right, sub }) {
  return (
    <header className="r8-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {left}
        <div style={{ minWidth: 0 }}>
          {typeof title === "string" ? <h1>{title}</h1> : title}
          {sub && <p className="r8-faint" style={{ fontSize: 13, marginTop: 2 }}>{sub}</p>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{right}</div>
    </header>
  );
}

export function Sheet({ open, onClose, title, children, labelledBy }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = prev; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="r8-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="r8-sheet" role="dialog" aria-modal="true" aria-labelledby={labelledBy}
            initial={{ y: "100%", opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
            transition={softSpring}
          >
            <div className="r8-sheet__grab" />
            {title && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <h2 id={labelledBy} style={{ fontSize: 22 }}>{title}</h2>
                <button className="r8-icon-btn r8-icon-btn--round" onClick={onClose} aria-label="Close"><Icon name="x" size={20} /></button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function EmptyState({ icon = "sparkle", title, body, action }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "56px 28px", gap: 14 }}>
      <div style={{ width: 72, height: 72, borderRadius: 24, background: "var(--iri-soft)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-6deg)" }}>
        <Icon name={icon} size={30} />
      </div>
      <h3 style={{ fontSize: 22 }}>{title}</h3>
      {body && <p className="r8-muted" style={{ maxWidth: 320, fontSize: 15 }}>{body}</p>}
      {action}
    </div>
  );
}

export function Spinner({ label }) {
  return (
    <div role="status" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 40 }}>
      <div className="r8-spinner" />
      {label && <p className="r8-faint" style={{ fontSize: 14 }}>{label}</p>}
    </div>
  );
}

export function TraitChip({ icon, label }) {
  return <span className="r8-chip"><Icon name={icon} size={16} />{label}</span>;
}

// Selectable tile used in onboarding and settings
export function OptionTile({ selected, onClick, icon, label, sub }) {
  return (
    <motion.button
      type="button" onClick={onClick} aria-pressed={!!selected}
      whileTap={{ scale: 0.96 }}
      style={{
        textAlign: "left", padding: "14px 14px 13px", borderRadius: 18, minHeight: 84,
        background: selected ? "var(--iri-soft)" : "var(--glass)",
        border: `1.5px solid ${selected ? "rgba(140,158,255,.7)" : "var(--line)"}`,
        boxShadow: selected ? "0 10px 28px rgba(140,158,255,.22)" : "none",
        display: "flex", flexDirection: "column", gap: 6, color: "var(--text)",
        transition: "background .25s, border-color .25s, box-shadow .25s",
        position: "relative",
      }}
    >
      {icon && <Icon name={icon} size={22} />}
      <span style={{ fontWeight: 600, fontSize: 15 }}>{label}</span>
      {sub && <span style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.35 }}>{sub}</span>}
      {selected && (
        <span style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%", background: "var(--iri)", color: "var(--on-iri)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="check" size={14} stroke={2.6} />
        </span>
      )}
    </motion.button>
  );
}

export function Steps({ step, total = 3, labels = [] }) {
  return (
    <div aria-label={`Step ${step} of ${total}`} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < step ? "var(--iri)" : "var(--line-2)", transition: "background .4s" }} />
        ))}
      </div>
      <p className="r8-eyebrow">Step {step} of {total}{labels[step - 1] ? `  /  ${labels[step - 1]}` : ""}</p>
    </div>
  );
}

export function Field({ label, children, help, htmlFor }) {
  return (
    <div className="r8-field">
      {label && <label className="r8-label" htmlFor={htmlFor}>{label}</label>}
      {children}
      {help && <span className="r8-help">{help}</span>}
    </div>
  );
}
