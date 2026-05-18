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
