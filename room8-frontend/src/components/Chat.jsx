import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../ui/Icon";
import { Avatar, Sheet, EmptyState } from "../ui/kit";
import { getChat, sendMessage as apiSendMessage, reportUser, blockUser, unmatchUser, getRoommateStatus, confirmRoommate } from "../api";

function formatMsgTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((todayStart - msgDayStart) / 86400000);
  const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (diffDays === 0) return timeStr;
  if (diffDays === 1) return `Yesterday`;
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const SUGGESTED_PROMPTS = [
  "what's your sleep schedule like?",
  "are you neat or more relaxed?",
  "do you study in your room?",
  "how do you feel about guests?",
  "what are you looking for in a roommate?",
];

const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "fake", label: "Fake profile" },
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
];

export default function Chat({ userId, peerId, peerName, peerPhoto, onBack, onUnmatch, onBlock: onBlockProp, incomingMessage, onViewProfile }) {
  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState("");
  const [sending,         setSending]         = useState(false);
  const [sendError,       setSendError]       = useState("");
  const [loading,         setLoading]         = useState(true);
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [showReport,      setShowReport]      = useState(false);
  const [reportReason,    setReportReason]    = useState("inappropriate");
  const [reportSubmitting,setReportSubmitting]= useState(false);
  const [reportDone,      setReportDone]      = useState(false);
  const [confirmStatus,   setConfirmStatus]   = useState({ i_confirmed: false, they_confirmed: false, both_confirmed: false });
  const [confirming,      setConfirming]      = useState(false);
  const [showConfirmBanner, setShowConfirmBanner] = useState(false);
  const menuRef   = useRef(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (!userId || !peerId) return;
    setLoading(true);
    getChat(userId, peerId)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, peerId]);

  // Append real-time messages pushed from the WebSocket
  useEffect(() => {
    if (!incomingMessage) return;
    setMessages((prev) => {
      // Guard against duplicate delivery (e.g. after reconnect)
      const isDup = prev.some(
        (m) =>
          m.sender_id === incomingMessage.sender_id &&
          m.created_at === incomingMessage.created_at
      );
      if (isDup) return prev;
      return [...prev, incomingMessage];
    });
  }, [incomingMessage]);

  const fetchRoommateStatus = useCallback(() => {
    if (!peerId) return;
    getRoommateStatus(peerId)
      .then((s) => {
        setConfirmStatus(s);
        // Show the banner if peer has requested but we haven't confirmed yet
        if (s.they_confirmed && !s.i_confirmed) setShowConfirmBanner(true);
        else setShowConfirmBanner(false);
      })
      .catch(console.error);
  }, [peerId]);

  useEffect(() => {
    setConfirmStatus({ i_confirmed: false, they_confirmed: false, both_confirmed: false });
    setShowConfirmBanner(false);
    fetchRoommateStatus();
  }, [peerId]); // eslint-disable-line

  // Poll roommate status every 12 seconds while chat is open
  useEffect(() => {
    if (!peerId) return;
    const id = setInterval(fetchRoommateStatus, 12000);
    return () => clearInterval(id);
  }, [peerId, fetchRoommateStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [peerId]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleConfirmRoommate = async () => {
    if (confirming || confirmStatus.both_confirmed) return;
    setConfirming(true);
    try {
      const result = await confirmRoommate(peerId);
      setConfirmStatus((prev) => ({ ...prev, ...result }));
      if (result.both_confirmed) setShowConfirmBanner(false);
    } catch (e) {
      console.error(e);
    } finally {
      setConfirming(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSendError("");
    setSending(true);
    try {
      await apiSendMessage(peerId, userId, text);
      setMessages((prev) => [...prev, { sender_id: userId, text, created_at: new Date().toISOString() }]);
    } catch (err) {
      console.error("Send error:", err);
      setInput(text);
      setSendError("Failed to send.");
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleUnmatch = async () => {
    setMenuOpen(false);
    try {
      await unmatchUser(userId, peerId);
      onUnmatch?.();
    } catch (e) { console.error(e); }
  };

  const handleBlock = async () => {
    setMenuOpen(false);
    try {
      await blockUser(userId, peerId);
      onBlockProp?.();
    } catch (e) { console.error(e); }
  };

  const handleReportOpen = () => {
    setMenuOpen(false);
    setShowReport(true);
  };

  const submitReport = async () => {
    setReportSubmitting(true);
    try {
      await reportUser(userId, peerId, reportReason, "");
      setReportDone(true);
      setTimeout(() => {
        setShowReport(false);
        setReportDone(false);
        setReportReason("inappropriate");
      }, 1500);
    } catch (e) { console.error(e); }
    finally { setReportSubmitting(false); }
  };

  const firstName = peerName?.split(" ")[0] || "them";
  const status = confirmStatus.both_confirmed ? "Confirmed roommates" : confirmStatus.i_confirmed ? "Waiting on them to confirm" : "Matched";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: "var(--bg)", position: "relative" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "calc(var(--safe-t) + 10px) 14px 10px", borderBottom: "1px solid var(--line)", background: "color-mix(in srgb, var(--bg) 80%, transparent)", WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)", flexShrink: 0, zIndex: 5 }}>
        {onBack && <button className="r8-icon-btn r8-icon-btn--round" onClick={onBack} aria-label="Back to chats" style={{ background: "transparent", borderColor: "transparent" }}><Icon name="back" size={24} /></button>}
        <button onClick={onViewProfile} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, textAlign: "left", borderRadius: 16 }} aria-label={`View ${firstName}'s profile`}>
          <Avatar src={peerPhoto} name={peerName} size={42} ring={confirmStatus.both_confirmed} />
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontWeight: 700, fontSize: 17, fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>{firstName}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: confirmStatus.both_confirmed ? "var(--success)" : "var(--text-3)" }}>
              {confirmStatus.both_confirmed && <Icon name="home" size={13} />}{status}
            </span>
          </span>
        </button>
        {!confirmStatus.both_confirmed && (
          <button className={`r8-btn r8-btn--sm ${confirmStatus.i_confirmed ? "r8-btn--glass" : "r8-btn--primary"}`} onClick={handleConfirmRoommate} disabled={confirming || confirmStatus.i_confirmed}
            title={confirmStatus.i_confirmed ? "You confirmed, waiting on them" : "Confirm this person as your roommate"} style={{ height: 36, padding: "0 14px", fontSize: 13.5 }}>
            <Icon name={confirmStatus.i_confirmed ? "check" : "key"} size={16} />{confirming ? "Confirming" : confirmStatus.i_confirmed ? "Confirmed" : "Roommates?"}
          </button>
        )}
        <button className="r8-icon-btn r8-icon-btn--round" onClick={() => setMenuOpen(true)} aria-label="Chat options" style={{ background: "transparent", borderColor: "transparent" }}><Icon name="more" size={22} /></button>
      </header>

      <AnimatePresence>
        {showConfirmBanner && !confirmStatus.both_confirmed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden", flexShrink: 0 }}>
            <div style={{ margin: "10px 14px 0", padding: "12px 14px", borderRadius: 18, background: "var(--elev)", border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: 12, background: "var(--iri)", color: "#0E0F12", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="home" size={19} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{firstName} wants to make it official</p>
                <p className="r8-muted" style={{ fontSize: 13 }}>Tap Roommates? to confirm.</p>
              </div>
              <button className="r8-btn r8-btn--ghost r8-btn--sm" style={{ height: 32, padding: "0 8px" }} onClick={() => setShowConfirmBanner(false)} aria-label="Dismiss"><Icon name="x" size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {confirmStatus.both_confirmed && (
        <div style={{ margin: "10px 14px 0", padding: "12px 14px", borderRadius: 18, background: "rgba(61,220,151,.10)", border: "1px solid rgba(61,220,151,.28)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span className="r8-sticker r8-sticker--pill" style={{ fontSize: 12 }}><Icon name="home" size={13} />roomies</span>
          <p style={{ fontSize: 14 }}>You and {firstName} are official. Your housing office has been notified.</p>
        </div>
      )}

      {/* Messages */}
      <div className="r8-noscroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 14px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10 }}>
            {[60, 45, 70].map((w, i) => <div key={i} className="r8-skel" style={{ height: 40, width: `${w}%`, alignSelf: i % 2 ? "flex-end" : "flex-start", borderRadius: 20 }} />)}
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "36px 10px 10px", gap: 10 }}>
            <Avatar src={peerPhoto} name={peerName} size={88} ring />
            <h3 style={{ fontSize: 22, marginTop: 6 }}>You matched with {firstName}</h3>
            <p className="r8-muted" style={{ fontSize: 15, marginBottom: 10 }}>Break the ice. Tap one to start.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 380 }}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <motion.button key={prompt} whileTap={{ scale: 0.95 }} className="r8-chip" style={{ height: 40, fontSize: 14.5, cursor: "pointer" }}
                  onClick={() => { setInput(prompt); inputRef.current?.focus(); }}>{prompt}</motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isMe = String(m.sender_id) === String(userId);
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const showDivider = !prev || (m.created_at && prev.created_at && new Date(m.created_at) - new Date(prev.created_at) > 5 * 60 * 1000);
          const samePrev = prev && String(prev.sender_id) === String(m.sender_id) && !showDivider;
          const isLastInRun = !next || String(next.sender_id) !== String(m.sender_id) || (m.created_at && next.created_at && new Date(next.created_at) - new Date(m.created_at) > 5 * 60 * 1000);
          const r = 22, t = 7;
          const radius = isMe
            ? `${r}px ${samePrev ? t : r}px ${isLastInRun ? t : t}px ${r}px`
            : `${samePrev ? t : r}px ${r}px ${r}px ${isLastInRun ? t : t}px`;
          return (
            <React.Fragment key={i}>
              {showDivider && m.created_at && (
                <div style={{ textAlign: "center", margin: "12px 0 8px" }}>
                  <span className="r8-faint" style={{ fontSize: 12, fontWeight: 500 }}>{formatMsgTime(m.created_at)}</span>
                </div>
              )}
              <motion.div
                initial={i >= messages.length - 1 ? { opacity: 0, y: 10, scale: 0.96 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", marginTop: samePrev ? 0 : 6 }}>
                <div style={{
                  maxWidth: "78%", padding: "10px 15px", borderRadius: radius, fontSize: 16, lineHeight: 1.42, wordBreak: "break-word",
                  ...(isMe
                    ? { background: "var(--text)", color: "var(--bg)" }
                    : { background: "var(--elev-2)", color: "var(--text)", border: "1px solid var(--line)" }),
                }}>
                  {m.text}
                </div>
                {isLastInRun && m.created_at && (
                  <span className="r8-faint" style={{ fontSize: 11.5, marginTop: 4, padding: "0 6px" }}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                )}
              </motion.div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {sendError && <div className="r8-error" style={{ margin: "0 14px 8px", padding: "8px 12px" }}>{sendError} Tap send to try again.</div>}

      {/* Composer */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", padding: "10px 12px calc(var(--safe-b) + 10px)", flexShrink: 0, background: "color-mix(in srgb, var(--bg) 85%, transparent)", WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)" }}>
        <input
          ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder={`Message ${firstName}`} aria-label={`Message ${firstName}`}
          className="r8-input" style={{ flex: 1, borderRadius: 999, minHeight: 48, padding: "0 18px" }}
        />
        <motion.button whileTap={{ scale: 0.88 }} onClick={handleSend} disabled={!input.trim() || sending} aria-label="Send"
          style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s",
            ...(input.trim() ? { background: "var(--iri)", color: "#0E0F12", boxShadow: "var(--glow)" } : { background: "var(--glass-2)", color: "var(--text-3)", border: "1px solid var(--line)" }) }}>
          <Icon name="arrowUp" size={22} stroke={2.4} />
        </motion.button>
      </div>

      {/* Options */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title={firstName} labelledBy="r8-chat-menu">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {onViewProfile && <button className="r8-btn r8-btn--glass r8-btn--block" style={{ justifyContent: "flex-start" }} onClick={() => { setMenuOpen(false); onViewProfile(); }}><Icon name="user" size={20} />View profile</button>}
          <button className="r8-btn r8-btn--glass r8-btn--block" style={{ justifyContent: "flex-start" }} onClick={handleReportOpen}><Icon name="flag" size={20} />Report</button>
          <button className="r8-btn r8-btn--glass r8-btn--block" style={{ justifyContent: "flex-start", color: "var(--danger)" }} onClick={handleUnmatch}><Icon name="x" size={20} />Unmatch</button>
          <button className="r8-btn r8-btn--glass r8-btn--block" style={{ justifyContent: "flex-start", color: "var(--danger)" }} onClick={handleBlock}><Icon name="block" size={20} />Block</button>
        </div>
      </Sheet>

      <Sheet open={showReport} onClose={() => { setShowReport(false); setReportDone(false); }} title={reportDone ? "" : `Report ${firstName}`} labelledBy="r8-chat-report">
        {reportDone ? (
          <EmptyState icon="shield" title="Report sent" body="Thanks for keeping Room8 safe. We'll take a look." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p className="r8-muted" style={{ fontSize: 15, marginBottom: 4 }}>What's going on? They won't know you reported them.</p>
            {REPORT_REASONS.map((r) => (
              <button key={r.value} onClick={() => setReportReason(r.value)} aria-pressed={reportReason === r.value}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 52, padding: "0 16px", borderRadius: 16, textAlign: "left", fontSize: 15, fontWeight: 500,
                  background: reportReason === r.value ? "var(--iri-soft)" : "var(--glass)", border: `1.5px solid ${reportReason === r.value ? "rgba(140,158,255,.7)" : "var(--line)"}` }}>
                {r.label}{reportReason === r.value && <Icon name="check" size={18} stroke={2.4} />}
              </button>
            ))}
            <button className="r8-btn r8-btn--danger r8-btn--block" onClick={submitReport} disabled={reportSubmitting}>{reportSubmitting ? "Sending..." : "Send report"}</button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
