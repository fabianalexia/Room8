import React, { useState, useEffect, useRef } from "react";
import { getChat, sendMessage as apiSendMessage } from "../api";

const NAVY   = "#0F2D5E";
const GOLD   = "#F59E0B";
const DARK   = "#050D1F";
const DARKER = "#030914";
const WHITE  = "#FFFFFF";
const MUTED  = "rgba(255,255,255,0.4)";
const BORDER = "rgba(255,255,255,0.08)";
const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

const SUGGESTED_PROMPTS = [
  "What's your sleep schedule like?",
  "What's your major?",
  "Are you tidy or more relaxed?",
  "Do you study in your room?",
  "What are you looking for in a roommate?",
];

export default function Chat({ userId, peerId, peerName, peerPhoto, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [peerId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const optimistic = { sender_id: userId, text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);

    try {
      await apiSendMessage(peerId, userId, text);
    } catch (err) {
      console.error("Send error:", err);
      setMessages((prev) => prev.filter((m) => m !== optimistic));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const initials = peerName?.[0]?.toUpperCase() || "?";

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: `linear-gradient(180deg, ${DARKER} 0%, #071020 100%)`,
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 20px",
        borderBottom: `1px solid ${BORDER}`,
        background: "rgba(3,9,20,0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        flexShrink: 0,
      }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.6)",
            fontSize: "1.3rem", cursor: "pointer", padding: "0 8px 0 0",
            display: "flex", alignItems: "center",
            transition: "color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = WHITE}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
          >
            ←
          </button>
        )}
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: peerPhoto ? `url(${peerPhoto}) center/cover` : NAVY,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: WHITE, fontWeight: 700, fontSize: "1rem",
          border: `2px solid rgba(245,158,11,0.4)`,
        }}>
          {!peerPhoto && initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: WHITE, fontWeight: 700, fontSize: "0.95rem", fontFamily: HF }}>{peerName || "Chat"}</div>
          <div style={{ color: "rgba(245,158,11,0.7)", fontSize: "0.7rem", fontFamily: BF }}>Matched with you</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px 20px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {loading && (
          <div style={{ textAlign: "center", color: MUTED, paddingTop: 40, fontSize: "0.9rem", fontFamily: BF }}>
            Loading messages…
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40, gap: 0 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", marginBottom: 16,
              background: peerPhoto ? `url(${peerPhoto}) center/cover` : NAVY,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: WHITE, fontWeight: 700, fontSize: "1.8rem",
              border: `3px solid rgba(245,158,11,0.4)`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}>
              {!peerPhoto && initials}
            </div>
            <p style={{ color: WHITE, fontWeight: 700, margin: "0 0 4px", fontSize: "1rem", fontFamily: HF }}>
              You matched with {peerName?.split(" ")[0]}!
            </p>
            <p style={{ color: MUTED, fontSize: "0.85rem", margin: "0 0 24px", fontFamily: BF }}>
              Be the first to say something
            </p>

            {/* Suggested prompts */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 360 }}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${BORDER}`,
                    color: "rgba(255,255,255,0.7)",
                    padding: "8px 14px", borderRadius: 20,
                    fontSize: "0.8rem", fontWeight: 500,
                    cursor: "pointer", fontFamily: BF,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)";
                    e.currentTarget.style.color = GOLD;
                    e.currentTarget.style.background = "rgba(245,158,11,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isMe = String(m.sender_id) === String(userId);
          return (
            <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "72%",
                padding: "10px 15px",
                borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: isMe
                  ? `linear-gradient(135deg, ${NAVY}, #1a3f7a)`
                  : "rgba(255,255,255,0.07)",
                color: WHITE,
                fontSize: "0.93rem",
                lineHeight: 1.5,
                boxShadow: isMe
                  ? "0 2px 12px rgba(15,45,94,0.4)"
                  : "0 1px 4px rgba(0,0,0,0.2)",
                border: isMe ? "none" : `1px solid ${BORDER}`,
                fontFamily: BF,
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: "flex", gap: 10, padding: "12px 16px",
        borderTop: `1px solid ${BORDER}`,
        background: "rgba(3,9,20,0.8)",
        backdropFilter: "blur(16px)",
        alignItems: "flex-end",
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Message ${peerName || ""}…`}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.06)",
            border: `1.5px solid ${BORDER}`,
            borderRadius: 24, color: WHITE, padding: "10px 16px",
            fontSize: "0.93rem", outline: "none",
            transition: "border-color 0.2s",
            fontFamily: BF,
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = BORDER)}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: 42, height: 42, borderRadius: "50%", border: "none",
            background: input.trim() ? GOLD : "rgba(255,255,255,0.08)",
            color: input.trim() ? DARK : "rgba(255,255,255,0.3)",
            fontSize: "1rem", cursor: input.trim() ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.15s",
            boxShadow: input.trim() ? "0 4px 16px rgba(245,158,11,0.4)" : "none",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
