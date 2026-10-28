// Shared badge shown on profiles, cards, and lists
// isStudent=true  → gold "Verified Student" badge
// isStudent=false → gray "Community Member" badge

export default function VerifiedBadge({ isStudent, size = "sm" }) {
  const small = size === "sm";
  if (isStudent) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: small ? 3 : 4,
        background: "rgba(245,158,11,0.12)",
        border: "1px solid rgba(245,158,11,0.35)",
        borderRadius: 6,
        padding: small ? "2px 7px" : "4px 10px",
        fontSize: small ? "0.65rem" : "0.75rem",
        fontWeight: 700,
        color: "#F5A623",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        ✓ Verified Student
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: small ? 3 : 4,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 6,
      padding: small ? "2px 7px" : "4px 10px",
      fontSize: small ? "0.65rem" : "0.75rem",
      fontWeight: 600,
      color: "rgba(255,255,255,0.5)",
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      Community Member
    </span>
  );
}

// Blue check shown next to a name once photo verification is approved
export function PhotoVerifiedCheck({ verified, size = 18, title = "Photo verified" }) {
  if (!verified) return null;
  return (
    <span title={title} aria-label={title} role="img" style={{ display: "inline-flex", flexShrink: 0, verticalAlign: "middle" }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#1D9BF0" d="M12 1.5l2.6 1.9 3.2-.2 1 3.1 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3.1-3.2-.2L12 22.5l-2.6-1.9-3.2.2-1-3.1L2.6 15.8l1-3.1-1-3.1 2.6-1.9 1-3.1 3.2.2z"/>
        <path fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M7.5 12.3l3 3 6-6.3"/>
      </svg>
    </span>
  );
}
