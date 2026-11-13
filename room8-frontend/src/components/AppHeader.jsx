// Shared header for the three Home views: Match (swipe), Browse (best fit), For You (likes)
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Wordmark } from "../ui/Logo";
import Icon from "../ui/Icon";
import { haptic } from "../native";

const SEGS = [
  { label: "Match", to: "/app" },
  { label: "Browse", to: "/discover" },
  { label: "For You", to: "/likes" },
];

export default function AppHeader({ right }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--bg)", padding: "calc(var(--safe-t) + 14px) 20px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Wordmark size={28} />
        <div style={{ display: "flex", gap: 10 }}>
          {right}
          <button className="r8-icon-btn r8-icon-btn--round" aria-label="Edit preferences" onClick={() => navigate("/profile")} style={{ background: "var(--elev-2)", border: 0 }}>
            <Icon name="sliders" size={21} />
          </button>
        </div>
      </div>
      <div role="tablist" style={{ display: "flex", background: "var(--elev-2)", borderRadius: 999, padding: 4 }}>
        {SEGS.map((s) => {
          const active = pathname === s.to;
          return (
            <button key={s.to} role="tab" aria-selected={active}
              onClick={() => { if (!active) { haptic("light"); navigate(s.to); } }}
              style={{ flex: 1, height: 38, borderRadius: 999, position: "relative", fontSize: 15, fontWeight: 600, color: active ? "var(--bg)" : "var(--text-2)", transition: "color .25s" }}>
              {active && <motion.span layoutId="r8-seg" transition={{ type: "spring", stiffness: 520, damping: 40 }} style={{ position: "absolute", inset: 0, borderRadius: 999, background: "var(--text)" }} />}
              <span style={{ position: "relative" }}>{s.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
