import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getMatches } from "./api";
import Chat from "./components/Chat";

const NAVY   = "#0F2D5E";
const GOLD   = "#F59E0B";
const DARK   = "#050D1F";
const DARKER = "#030914";
const WHITE  = "#FFFFFF";
const MUTED  = "rgba(255,255,255,0.45)";
const BORDER = "rgba(255,255,255,0.08)";
const SURFACE = "rgba(255,255,255,0.04)";

function relTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Avatar({ src, name, size = 56, ring = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: src ? `url(${src}) center/cover` : NAVY,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: WHITE, fontWeight: 700, fontSize: size * 0.35,
        cursor: onClick ? "pointer" : "default",
        border: ring ? `2.5px solid ${GOLD}` : `2px solid rgba(255,255,255,0.12)`,
        boxShadow: ring ? `0 0 12px rgba(245,158,11,0.4)` : "none",
        transition: "transform 0.15s",
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.transform = "scale(1.05)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
    >
      {!src && (name?.[0]?.toUpperCase() || "?")}
    </div>
  );
}

function NoMatchesEmpty() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", padding: "52px 28px" }}>
      <div style={{
        width: 80, height: 80, margin: "0 auto 20px",
        borderRadius: "50%",
        background: "rgba(245,158,11,0.1)",
        border: `1px solid rgba(245,158,11,0.25)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "2rem",
      }}>💬</div>
      <p style={{ color: WHITE, fontWeight: 700, fontSize: "1.05rem", margin: "0 0 8px" }}>
        No matches yet
      </p>
      <p style={{ color: MUTED, fontSize: "0.85rem", lineHeight: 1.6, margin: "0 0 24px", maxWidth: 200, marginLeft: "auto", marginRight: "auto" }}>
        Start swiping to find your perfect Room8. Matches appear here.
      </p>
      <button
        onClick={() => navigate("/app")}
        style={{
          background: GOLD, color: DARK, border: "none",
          padding: "11px 24px", borderRadius: 8,
          fontWeight: 700, fontSize: "0.9rem",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
        }}
      >
        Start Swiping
      </button>
    </div>
  );
}

// Receives matches + loading from parent so unmatch/block updates reflect immediately
function MatchesPanel({ matches, loading, onSelect, selectedId, isMobile }) {
  const newMatches = matches.filter((m) => !m.last_message);
  const messaged   = matches.filter((m) =>  m.last_message);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: DARK,
      borderRight: isMobile ? "none" : `1px solid ${BORDER}`,
    }}>
      {/* Header */}
      <div style={{
        padding: "18px 20px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
        background: "rgba(3,9,20,0.6)",
        backdropFilter: "blur(12px)",
      }}>
        <h1 style={{
          margin: 0, fontSize: "1.3rem", fontWeight: 800,
          color: WHITE, letterSpacing: "-0.025em",
          fontFamily: "'Outfit', sans-serif",
        }}>
          Messages
        </h1>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: MUTED, fontSize: "0.9rem" }}>Loading…</div>
        )}

        {!loading && matches.length === 0 && <NoMatchesEmpty />}

        {/* New Matches row */}
        {newMatches.length > 0 && (
          <div style={{ paddingTop: 16 }}>
            <p style={{
              margin: "0 20px 10px",
              fontSize: "0.7rem", fontWeight: 700, color: "rgba(245,158,11,0.7)",
              textTransform: "uppercase", letterSpacing: 1.2,
            }}>
              New Matches
            </p>
            <div style={{
              display: "flex", gap: 12, overflowX: "auto",
              padding: "0 20px 16px", scrollbarWidth: "none",
            }}>
              {newMatches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelect(m)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", minWidth: 56 }}
                >
                  <Avatar src={m.photo} name={m.name} size={56} ring />
                  <span style={{
                    color: WHITE, fontSize: "0.68rem", fontWeight: 600,
                    maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {m.name?.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages list */}
        {messaged.length > 0 && (
          <div style={{ borderTop: newMatches.length > 0 ? `1px solid ${BORDER}` : "none", paddingTop: 4 }}>
            <p style={{
              margin: "12px 20px 4px",
              fontSize: "0.7rem", fontWeight: 700, color: MUTED,
              textTransform: "uppercase", letterSpacing: 1.2,
            }}>
              Conversations
            </p>
            {messaged.map((m) => {
              const active  = m.id === selectedId;
              const preview = m.last_message_mine ? `You: ${m.last_message}` : m.last_message;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelect(m)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 20px", cursor: "pointer",
                    background: active ? "rgba(245,158,11,0.1)" : "transparent",
                    borderLeft: `3px solid ${active ? GOLD : "transparent"}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = SURFACE; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <Avatar src={m.photo} name={m.name} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ color: active ? GOLD : WHITE, fontWeight: 700, fontSize: "0.9rem" }}>
                        {m.name?.split(" ")[0]}
                      </span>
                      <span style={{ color: MUTED, fontSize: "0.68rem", flexShrink: 0, marginLeft: 6 }}>
                        {relTime(m.last_message_at)}
                      </span>
                    </div>
                    <div style={{
                      color: MUTED, fontSize: "0.82rem", marginTop: 2,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {preview}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChat() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100%", gap: 0, padding: 40, textAlign: "center",
      background: `linear-gradient(180deg, ${DARKER} 0%, #071020 100%)`,
    }}>
      <div style={{ display: "flex", marginBottom: 24, position: "relative", width: 100, height: 56 }}>
        {[NAVY, "#1a4a8a", "#2563EB"].map((c, i) => (
          <div key={i} style={{
            position: "absolute", left: i * 28,
            width: 52, height: 52, borderRadius: "50%",
            background: c,
            border: `2.5px solid ${DARK}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.3rem",
          }}>
            {["👋", "💬", "✓"][i]}
          </div>
        ))}
      </div>
      <h3 style={{ color: WHITE, margin: "0 0 10px", fontWeight: 800, fontSize: "1.1rem" }}>
        Select a conversation
      </h3>
      <p style={{ color: MUTED, maxWidth: 240, fontSize: "0.88rem", lineHeight: 1.6, margin: "0 0 28px" }}>
        Choose a match from the left to start chatting.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 280 }}>
        <p style={{ color: "rgba(245,158,11,0.6)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 4px" }}>
          Conversation starters
        </p>
        {["What's your sleep schedule like?", "What's your major?", "Are you neat or more relaxed?"].map((p) => (
          <div key={p} style={{
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: "10px 14px",
            color: MUTED, fontSize: "0.85rem", textAlign: "left",
          }}>
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const user = getCurrentUser();
  const [selected,       setSelected]       = useState(null);
  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 768);
  const [mobileView,     setMobileView]     = useState("list");
  const [matches,        setMatches]        = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (!user) { setMatchesLoading(false); return; }
    getMatches(user.id).then(setMatches).catch(console.error).finally(() => setMatchesLoading(false));
  }, []); // eslint-disable-line

  const handleSelect = useCallback((match) => {
    setSelected(match);
    if (isMobile) setMobileView("chat");
  }, [isMobile]);

  const handleBack = useCallback(() => {
    setMobileView("list");
    setSelected(null);
  }, []);

  // Called after unmatch or block — removes the peer from the list and clears the chat
  const removeMatch = useCallback((peerId) => {
    setMatches((prev) => prev.filter((m) => m.id !== peerId));
    setSelected((prev) => {
      if (prev?.id === peerId) {
        if (isMobile) setMobileView("list");
        return null;
      }
      return prev;
    });
  }, [isMobile]);

  const chatProps = selected ? {
    userId:    user?.id,
    peerId:    selected.id,
    peerName:  selected.name,
    peerPhoto: selected.photo,
    onUnmatch: () => removeMatch(selected.id),
    onBlock:   () => removeMatch(selected.id),
  } : null;

  if (isMobile) {
    return (
      <div style={{ height: "calc(100vh - 64px)", background: DARK, overflow: "hidden" }}>
        {mobileView === "list" ? (
          <MatchesPanel
            matches={matches} loading={matchesLoading}
            onSelect={handleSelect} selectedId={selected?.id} isMobile
          />
        ) : (
          <Chat {...chatProps} onBack={handleBack} />
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "340px 1fr",
      height: "calc(100vh - 64px)", background: DARK, overflow: "hidden",
    }}>
      <MatchesPanel
        matches={matches} loading={matchesLoading}
        onSelect={handleSelect} selectedId={selected?.id} isMobile={false}
      />
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selected
          ? <Chat {...chatProps} onBack={() => setSelected(null)} />
          : <EmptyChat />
        }
      </div>
    </div>
  );
}
