// Shared frame for onboarding screens: progress, back, skip, sticky primary button
import React from "react";
import { motion } from "framer-motion";
import Icon from "../ui/Icon";
import { Mark } from "../ui/Logo";

export default function OnboardShell({ step, total = 3, label, onBack, onSkip, skipLabel = "Skip", title, sub, children, cta, error }) {
  return (
    <div className="r8-page" style={{ position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ position: "fixed", width: 460, height: 460, top: -220, right: -200 }} />
      <div aria-hidden="true" className="r8-aura r8-aura--b" style={{ position: "fixed", width: 380, height: 380, bottom: -160, left: -200 }} />
      <header style={{ position: "sticky", top: 0, zIndex: 20, padding: "calc(var(--safe-t) + 12px) 20px 12px", background: "color-mix(in srgb, var(--bg) 80%, transparent)", WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            {onBack ? <button className="r8-icon-btn r8-icon-btn--round" onClick={onBack} aria-label="Back"><Icon name="back" size={22} /></button> : <Mark size={36} />}
            <span className="r8-eyebrow">{label || `Step ${step} of ${total}`}</span>
            {onSkip ? <button type="button" className="r8-btn r8-btn--ghost r8-btn--sm" onClick={onSkip}>{skipLabel}</button> : <span style={{ width: 44 }} />}
          </div>
          {step && (
            <div style={{ display: "flex", gap: 6 }} aria-label={`Step ${step} of ${total}`}>
              {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: "var(--line-2)", overflow: "hidden" }}>
                  <motion.div initial={{ width: i < step - 1 ? "100%" : "0%" }} animate={{ width: i < step ? "100%" : "0%" }} transition={{ type: "spring", stiffness: 200, damping: 30 }} style={{ height: "100%", background: "var(--iri)" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </header>
      <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ position: "relative", maxWidth: 560, margin: "0 auto", padding: "20px 20px 150px" }}>
        {title && (
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: "clamp(30px, 8vw, 38px)", marginBottom: 8 }}>{title}</h1>
            {sub && <p className="r8-muted" style={{ fontSize: 16 }}>{sub}</p>}
          </div>
        )}
        {error && <div className="r8-error" style={{ marginBottom: 18 }}>{error}</div>}
        {children}
      </motion.main>
      {cta && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20, padding: "16px 20px calc(var(--safe-b) + 18px)", background: "linear-gradient(180deg, transparent, var(--bg) 38%)" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>{cta}</div>
        </div>
      )}
    </div>
  );
}
