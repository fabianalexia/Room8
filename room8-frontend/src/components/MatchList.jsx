import React, { useState, useEffect } from "react";
import { getCurrentUser, getMatches } from "../api";

const NAVY = "#0F2D5E";
const BLUE = "#2563EB";
const BORDER = "#E5E7EB";
const SURFACE = "#F8F9FA";
const MUTED = "#6B7280";

export default function MatchList({ onSelectMatch, selectedId }) {
  const user = getCurrentUser();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getMatches(user.id)
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) {
    return <p style={{ color: MUTED, fontSize: "0.85rem", padding: "8px 0" }}>Loading…</p>;
  }
  if (!matches.length) {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontSize: "2rem", marginBottom: 8 }}>♥</div>
        <p style={{ color: MUTED, fontSize: "0.85rem" }}>No matches yet — keep swiping!</p>
      </div>
    );
  }

  return (
    <div>
      {matches.map((match) => {
        const isActive = match.id === selectedId;
        const initial = match.name?.[0]?.toUpperCase() || "?";
        return (
          <div
            key={match.id}
            onClick={() => onSelectMatch && onSelectMatch(match)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 10px", borderRadius: 8, marginBottom: 2,
              cursor: "pointer",
              background: isActive ? "#EFF6FF" : "transparent",
              transition: "background 0.15s",
              borderLeft: `2px solid ${isActive ? BLUE : "transparent"}`,
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = SURFACE; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
          >
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
              background: match.photo ? `url(${match.photo}) center/cover` : NAVY,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "1rem",
              border: `2px solid ${isActive ? BLUE : BORDER}`,
            }}>
              {!match.photo && initial}
            </div>

            {/* Info */}
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: NAVY, fontWeight: 600, fontSize: "0.92rem" }}>
                {match.name}
              </div>
              {match.location && (
                <div style={{ color: MUTED, fontSize: "0.76rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {match.location}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
