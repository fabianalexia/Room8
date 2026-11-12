import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { getCurrentUser, getMatches, getProfile, getNotifications, markNotificationRead, markMessagesRead, getToken, API_URL } from "./api";
import { motion, AnimatePresence } from "framer-motion";
import ProfileModal from "./components/ProfileSheet";
import Chat from "./components/Chat";
import { sendNotification } from "./notifications";
import Icon from "./ui/Icon";
import { Mark } from "./ui/Logo";
import { Avatar, EmptyState, TopBar } from "./ui/kit";

function relTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const first = (n) => (n || "").split(" ")[0] || n || "";

function NotificationBell({ notifications, onDismiss }) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  if (notifications.length === 0) return null;
  const LABEL = {
    roommate_request: "wants to confirm you as roommates",
    roommate_confirmed: "confirmed you as roommates",
  };
  return (
    <div style={{ position: "relative" }}>
      <button className="r8-icon-btn r8-icon-btn--round" onClick={() => setOpen((v) => !v)} aria-label="Notifications" aria-expanded={open}>
        <Icon name="bell" size={21} />
        {unread > 0 && <span style={{ position: "absolute", top: 8, right: 9, width: 9, height: 9, borderRadius: "50%", background: "var(--pink)", border: "2px solid var(--bg)" }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="r8-card" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 300, zIndex: 300, padding: 8, borderRadius: 20, boxShadow: "var(--shadow-2)" }}>
            <p className="r8-eyebrow" style={{ padding: "8px 10px 6px" }}>Notifications</p>
            {notifications.map((n) => (
              <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 14, background: n.read ? "transparent" : "var(--glass)" }}>
                <Avatar src={n.from_photo} name={n.from_name} size={36} />
                <p style={{ flex: 1, fontSize: 14, lineHeight: 1.4 }}><b>{n.from_name}</b> {LABEL[n.type] || n.type}</p>
                {!n.read && <button className="r8-btn r8-btn--ghost r8-btn--sm" style={{ height: 30, padding: "0 10px" }} onClick={() => onDismiss(n.id)} aria-label="Dismiss"><Icon name="x" size={16} /></button>}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchesPanel({ matches, loading, onSelect, selectedId, isMobile, notifications, onDismissNotification, onViewProfile }) {
  const navigate = useNavigate();
  const newMatches = matches.filter((m) => !m.last_message);
  const messaged = matches.filter((m) => m.last_message);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, borderRight: isMobile ? "none" : "1px solid var(--line)", background: "var(--bg)" }}>
      <TopBar title="Chats" right={<NotificationBell notifications={notifications} onDismiss={onDismissNotification} />} />
      <div className="r8-noscroll" style={{ flex: 1, overflowY: "auto", paddingBottom: isMobile ? "calc(var(--nav-h) + var(--safe-b) + 24px)" : 24 }}>
        {loading && (
          <div style={{ padding: "8px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[0, 1, 2, 3].map((i) => <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}><div className="r8-skel" style={{ width: 56, height: 56, borderRadius: "50%" }} /><div style={{ flex: 1 }}><div className="r8-skel" style={{ height: 14, width: "40%", marginBottom: 8 }} /><div className="r8-skel" style={{ height: 12, width: "70%" }} /></div></div>)}
          </div>
        )}
        {!loading && matches.length === 0 && (
          <EmptyState icon="chat" title="No chats yet" body="When you and someone both like each other, your conversation starts here."
            action={<button className="r8-btn r8-btn--primary" onClick={() => navigate("/app")}><Icon name="flame" size={20} />Find roommates</button>} />
        )}

        {newMatches.length > 0 && (
          <section style={{ padding: "4px 0 10px" }}>
            <p className="r8-eyebrow" style={{ margin: "0 20px 12px" }}>New matches</p>
            <div className="r8-noscroll" style={{ display: "flex", gap: 16, overflowX: "auto", padding: "0 20px 6px" }}>
              {newMatches.map((m) => (
                <motion.button key={m.id} whileTap={{ scale: 0.94 }} onClick={() => onSelect(m)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 70, flexShrink: 0 }}>
                  <Avatar src={m.photo} name={m.name} size={66} ring />
                  <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{first(m.name)}</span>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {messaged.length > 0 && (
          <section style={{ paddingTop: 6 }}>
            <p className="r8-eyebrow" style={{ margin: "8px 20px 6px" }}>Messages</p>
            {messaged.map((m) => {
              const active = m.id === selectedId;
              const unread = !active && !!m.has_unread;
              return (
                <div key={m.id} role="button" tabIndex={0} onClick={() => onSelect(m)} onKeyDown={(e) => { if (e.key === "Enter") onSelect(m); }}
                  style={{ display: "flex", alignItems: "center", gap: 14, margin: "2px 10px", padding: "10px 10px", borderRadius: 20, cursor: "pointer", background: active ? "var(--glass-2)" : "transparent", transition: "background .2s" }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--glass)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  <button onClick={(e) => { e.stopPropagation(); onViewProfile?.(m); }} aria-label={`View ${first(m.name)}'s profile`} style={{ position: "relative", borderRadius: "50%", flexShrink: 0 }}>
                    <Avatar src={m.photo} name={m.name} size={56} ring={unread} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontWeight: unread ? 700 : 600, fontSize: 16 }}>{first(m.name)}</span>
                      <span style={{ fontSize: 12.5, color: unread ? "var(--text)" : "var(--text-3)", fontWeight: unread ? 600 : 400, flexShrink: 0 }}>{relTime(m.last_message_at)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                      <span style={{ flex: 1, fontSize: 14.5, color: unread ? "var(--text)" : "var(--text-2)", fontWeight: unread ? 500 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.last_message_mine ? "You: " : ""}{m.last_message}
                      </span>
                      {unread && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--iri)", flexShrink: 0 }} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

function EmptyChat() {
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 360, height: 360, top: "10%", right: "10%" }} />
      <div style={{ position: "relative", textAlign: "center", maxWidth: 340, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Mark size={64} />
        <h3 style={{ fontSize: 24 }}>Pick a conversation</h3>
        <p className="r8-muted" style={{ fontSize: 15 }}>Not sure what to say? Try one of these.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 4 }}>
          {["what's your sleep schedule like?", "are you neat or more relaxed?", "how do you feel about guests?"].map((t) => (
            <span key={t} className="r8-chip" style={{ height: 44, justifyContent: "center", fontSize: 15 }}>{t}</span>
          ))}
        </div>
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

      const isFromPeer = String(msg.sender_id) !== String(user.id);
      const isOpenConversation = selectedRef.current?.id === peerId;

      // Update the match-list preview; mark unread if from peer and chat isn't open
      setMatches((prev) =>
        prev.map((m) =>
          m.id === peerId
            ? {
                ...m,
                last_message:      msg.text,
                last_message_mine: !isFromPeer,
                last_message_at:   msg.created_at,
                has_unread: isFromPeer && !isOpenConversation ? true : m.has_unread,
              }
            : m
        )
      );

      // Deliver to the open Chat view only if it's a message from the peer
      // (the sender already has an optimistic update in Chat, so skip own messages)
      if (isOpenConversation && isFromPeer) {
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
    const matchPromise = getMatches(user.id).then((raw) => {
      const data = Array.isArray(raw) ? raw : [];
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

    const notifPromise = getNotifications().then((n) => setNotifications(Array.isArray(n) ? n : [])).catch(() => {});
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
    // Mark all messages from this peer as read
    if (match.has_unread) {
      markMessagesRead(match.id).catch(console.error);
      setMatches((prev) => prev.map((m) => m.id === match.id ? { ...m, has_unread: false } : m));
    }
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
      <div style={{ height: "100dvh", background: "var(--bg)", overflow: "hidden" }}>
        <MatchesPanel
          matches={matches} loading={matchesLoading}
          onSelect={handleSelect} selectedId={selected?.id} isMobile
          notifications={notifications} onDismissNotification={handleDismissNotification}
          onViewProfile={handleViewProfile}
        />
        <AnimatePresence>
          {mobileView === "chat" && chatProps && (
            <motion.div key="chat" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 38 }}
              style={{ position: "fixed", inset: 0, zIndex: 700, background: "var(--bg)" }}>
              <Chat {...chatProps} onBack={handleBack} onViewProfile={() => handleViewProfile(selected)} />
            </motion.div>
          )}
        </AnimatePresence>
        {profileView && <ProfileModal person={profileView} onClose={() => setProfileView(null)} />}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "100dvh", paddingBottom: "calc(var(--nav-h) + var(--safe-b) + 10px)", background: "var(--bg)", overflow: "hidden" }}>
      <MatchesPanel
        matches={matches} loading={matchesLoading}
        onSelect={handleSelect} selectedId={selected?.id} isMobile={false}
        notifications={notifications} onDismissNotification={handleDismissNotification}
        onViewProfile={handleViewProfile}
      />
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
        {selected
          ? <Chat {...chatProps} onBack={() => setSelected(null)} onViewProfile={() => handleViewProfile(selected)} />
          : <EmptyChat />}
      </div>
      {profileView && <ProfileModal person={profileView} onClose={() => setProfileView(null)} />}
    </div>
  );
}
