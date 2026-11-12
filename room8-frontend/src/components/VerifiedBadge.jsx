// Shared verification badges shown on profiles, cards and lists
import React from "react";
import Icon from "../ui/Icon";

export default function VerifiedBadge({ isStudent, size = "sm" }) {
  const big = size !== "sm";
  if (isStudent) {
    return (
      <span className="r8-badge r8-badge--iri" style={big ? { height: 28, fontSize: 13, padding: "0 11px" } : undefined}>
        <Icon name="school" size={big ? 15 : 13} stroke={2} />
        Verified student
      </span>
    );
  }
  return (
    <span className="r8-badge" style={big ? { height: 28, fontSize: 13, padding: "0 11px" } : undefined}>
      Community member
    </span>
  );
}

// Iridescent check shown next to a name once photo verification is approved
export function PhotoVerifiedCheck({ verified, size = 20, title = "Photo verified" }) {
  if (!verified) return null;
  return (
    <span title={title} aria-label={title} role="img" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      width: size, height: size, borderRadius: "50%", background: "var(--iri)", color: "#0E0F12",
      border: "2px solid #fff", transform: "rotate(-8deg)", boxShadow: "0 4px 12px rgba(0,0,0,.25)",
    }}>
      <Icon name="check" size={Math.round(size * 0.6)} stroke={3} />
    </span>
  );
}
