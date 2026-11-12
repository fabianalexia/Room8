// Iridescent match circle: "96% / Match"
import React from "react";

export default function MatchBadge({ pct, size = 66, label = "Match", style }) {
  if (pct == null) return null;
  return (
    <div aria-label={`${pct}% match`} style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "var(--iri)", color: "#111112",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      boxShadow: "0 8px 24px rgba(157,177,255,.4), inset 0 1px 0 rgba(255,255,255,.6)",
      ...style,
    }}>
      <b style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: size * 0.33, letterSpacing: "-0.04em", lineHeight: 1 }}>{pct}%</b>
      <small style={{ fontSize: Math.max(9, size * 0.16), fontWeight: 600, marginTop: 2, lineHeight: 1 }}>{label}</small>
    </div>
  );
}
