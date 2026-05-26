import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { getCurrentUser, getMatches, getProfile, getNotifications, markNotificationRead, getToken, API_URL } from "./api";
import { ProfileModal } from "./components/SwipeDeck";
import Chat from "./components/Chat";
import { sendNotification } from "./notifications";

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

function NotificationBell({ notifications, onDismiss }) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) return null;

  const LABEL = {
    roommate_request:   "wants to confirm you as roommates",
    roommate_confirmed: "You're confirmed roommates!",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative",
          background: open ? "rgba(255,255,255,0.1)" : "none",
          border: "none",
          color: open ? "#F59E0B" : "rgba(255,255,255,0.6)",
          width: 36, height: 36, borderRadius: "50%",
          cursor: "pointer", fontSize: "1.1rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 10, height: 10, borderRadius: "50%",
            background: "#F59E0B",
            border: "2px solid #030914",
          }} />
        )}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#0E1F3D",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
          minWidth: 260, maxWidth: 320, zIndex: 300,
        }}>
          <div style={{
            padding: "10px 14px 8px",
            fontSize: "0.7rem", fontWeight: 700,
            color: "rgba(245,158,11,0.8)",
            textTransform: "uppercase", letterSpacing: 1,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            Notifications
          </div>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                background: n.read ? "transparent" : "rgba(245,158,11,0.06)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: n.from_photo ? `url(${n.from_photo}) center/cover` : "#0F2D5E",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "0.85rem",
              }}>
                {!n.from_photo && (n.from_name?.[0]?.toUpperCase() || "?")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: "#fff", fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.4 }}>
                  {n.type === "roommate_confirmed" ? "🎉 " : "🏠 "}
                  <span style={{ color: "#F59E0B" }}>{n.from_name}</span>{" "}
                  {LABEL[n.type] || n.type}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => onDismiss(n.id)}
                  style={{
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.35)",
                    cursor: "pointer", fontSize: "0.75rem", flexShrink: 0,
                  }}
                  title="Dismiss"
                >✕</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Receives matches + loading from parent so unmatch/block updates reflect immediately
function MatchesPanel({ matches, loading, onSelect, selectedId, isMobile, notifications, onDismissNotification, onViewProfile }) {
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
        <NotificationBell notifications={notifications} onDismiss={onDismissNotification} />
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
                  <Avatar src={m.photo} name={m.name} size={56} ring onClick={() => onViewProfile?.(m)} />
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
                  <Avatar src={m.photo} name={m.name} size={48} onClick={(e) => { e.stopPropagation(); onViewProfile?.(m); }} />
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
  const user     = getCurrentUser();
  const location = useLocation();
  const [selected,       setSelected]       = useState(null);
  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 768);
  const [mobileView,     setMobileView]     = useState("list");
  const [matches,        setMatches]        = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [notifications,  setNotifications]  = useState([]);
  const [profileView, setProfileView] = useState(null);

  // Refs to track previous state for new-match / new-message detection
  const prevMatchIds      = useRef(new Set());
  const prevLastMessages  = useRef({});  // peerId -> last_message string

  // WebSocket refs and real-time message state
  const socketRef       = useRef(null);
  const joinedRoomsRef  = useRef(new Set());   // peer IDs whose rooms we've joined
  const selectedRef     = useRef(null);        // mirror of `selected` for socket callback
  const [incomingMessage, setIncomingMessage] = useState(null);

  const handleViewProfile = useCallback(async (match) => {
    try {
      const full = await getProfile(match.id);
      setProfileView({ ...match, ...full });
    } catch {
      setProfileView(match);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Keep selectedRef in sync so socket callbacks always see the current conversation
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // Reset incoming message when switching conversations so stale events don't bleed in
  useEffect(() => { setIncomingMessage(null); }, [selected?.id]); // eslint-disable-line

  // ── WebSocket: connect on mount, disconnect on unmount ────────────────────────
  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    const socket = io(API_URL, {
      query:               { token },
      transports:          ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay:   2000,
    });
    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      console.warn("[socket] connection error:", err.message);
    });

    socket.on("new_message", (msg) => {
      // Determine which peer this message belongs to
      const peerId = String(msg.sender_id) !== String(user.id)
        ? msg.sender_id
        : msg.recipient_id;

      // Update the match-list preview for that peer
      setMatches((prev) =>
        prev.map((m) =>
          m.id === peerId
            ? {
                ...m,
                last_message:      msg.text,
                last_message_mine: String(msg.sender_id) === String(user.id),
                last_message_at:   msg.created_at,
              }
            : m
        )
      );

      // Deliver to the open Chat view only if it's a message from the peer
      // (the sender already has an optimistic update in Chat, so skip own messages)
      if (
        selectedRef.current?.id === peerId &&
        String(msg.sender_id) !== String(user.id)
      ) {
        setIncomingMessage(msg);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current  = null;
      joinedRoomsRef.current.clear();
    };
  }, []); // eslint-disable-line

  // ── WebSocket: join conversation rooms whenever the matches list changes ──────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || matches.length === 0) return;

    const joinAll = () => {
      matches.forEach((m) => {
        if (!joinedRoomsRef.current.has(m.id)) {
          socket.emit("join_conversation", { peer_id: m.id });
          joinedRoomsRef.current.add(m.id);
        }
      });
    };

    if (socket.connected) {
      joinAll();
    } else {
      socket.once("connect", joinAll);
    }
  }, [matches]);

  // Fetch matches + notifications; detect new matches and new messages for push notifications.
  const refreshData = useCallback((isInitial = false, openUserId = null) => {
    if (!user) return;
    const matchPromise = getMatches(user.id).then((data) => {
      setMatches(data);

      if (isInitial) {
        // Seed refs so we don't fire notifications for existing data on mount
        prevMatchIds.current = new Set(data.map((m) => m.id));
        const msgs = {};
        data.forEach((m) => { msgs[m.id] = m.last_message || null; });
        prevLastMessages.current = msgs;
      } else {
        // Check for new matches
        data.forEach((m) => {
          if (!prevMatchIds.current.has(m.id)) {
            sendNotification(
              "You have a new match on Room8!",
              `You and ${m.name?.split(" ")[0] || "someone"} liked each other.`
            );
          }
        });
        prevMatchIds.current = new Set(data.map((m) => m.id));

        // Check for new messages
        data.forEach((m) => {
          const prev = prevLastMessages.current[m.id];
          if (m.last_message && m.last_message !== prev && !m.last_message_mine) {
            sendNotification(
              `New message from ${m.name?.split(" ")[0] || "your match"}`,
              m.last_message.length > 80 ? m.last_message.slice(0, 80) + "…" : m.last_message
            );
          }
          prevLastMessages.current[m.id] = m.last_message || null;
        });
      }

      if (openUserId) {
        const target = data.find((m) => m.id === openUserId);
        if (target) {
          setSelected(target);
          if (window.innerWidth < 768) setMobileView("chat");
        }
      }
    });

    const notifPromise = getNotifications().then(setNotifications);
    return Promise.all([matchPromise, notifPromise]);
  }, []); // eslint-disable-line

  // Re-fetch every time this page is navigated to (location.key changes on each visit).
  // Also auto-opens a specific conversation when openUserId is passed via navigation state.
  useEffect(() => {
    if (!user) { setMatchesLoading(false); return; }
    setMatchesLoading(true);
    const openUserId = location.state?.openUserId;
    refreshData(true, openUserId)
      .catch(console.error)
      .finally(() => setMatchesLoading(false));
  }, [location.key]); // eslint-disable-line

  const handleDismissNotification = useCallback((notifId) => {
    markNotificationRead(notifId).catch(console.error);
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, read: true } : n));
  }, []);

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
    userId:          user?.id,
    peerId:          selected.id,
    peerName:        selected.name,
    peerPhoto:       selected.photo,
    onUnmatch:       () => removeMatch(selected.id),
    onBlock:         () => removeMatch(selected.id),
    incomingMessage,
  } : null;

  if (isMobile) {
    return (
      <div style={{ height: "calc(100vh - 64px)", background: DARK, overflow: "hidden" }}>
        {mobileView === "list" ? (
          <MatchesPanel
            matches={matches} loading={matchesLoading}
            onSelect={handleSelect} selectedId={selected?.id} isMobile
            notifications={notifications} onDismissNotification={handleDismissNotification}
            onViewProfile={handleViewProfile}
          />
        ) : (
          <Chat {...chatProps} onBack={handleBack} />
        )}
        {profileView && <ProfileModal person={profileView} onClose={() => setProfileView(null)} />}
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
        notifications={notifications} onDismissNotification={handleDismissNotification}
        onViewProfile={handleViewProfile}
      />
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selected
          ? <Chat {...chatProps} onBack={() => setSelected(null)} />
          : <EmptyChat />
        }
      </div>
      {profileView && <ProfileModal person={profileView} onClose={() => setProfileView(null)} />}
    </div>
  );
}
