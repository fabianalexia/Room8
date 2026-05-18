// src/pages/LikesPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getLikes, getMatches, likeUser } from "../api";
import { sendNotification } from "../notifications";

const NAVY   = "#0F2D5E";
const GOLD   = "#F59E0B";
const GOLD_D = "#D97706";
const DARK   = "#050D1F";
const DARKER = "#030914";
const WHITE  = "#FFFFFF";
const MUTED  = "rgba(255,255,255,0.45)";
const BORDER = "rgba(255,255,255,0.09)";
const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

// ── Confetti particle, randomly placed, animated with CSS ──────
const CONFETTI_COLORS = [GOLD, "#FDE68A", "#FCD34D", "#ffffff", "#93C5FD", "#86EFAC", "#F9A8D4"];

function Confetti() {
  const particles = useRef(
    Array.from({ length: 42 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,       // vw %
      size: 5 + Math.random() * 7,  // px
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      duration: 2.2 + Math.random() * 2.2,
      delay: Math.random() * 1.2,
      shape: i % 3 === 0 ? "circle" : i % 3 === 1 ? "rect" : "star",
      spin: Math.random() > 0.5,
    }))
  ).current;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.shape === "rect" ? p.size * 0.5 : p.size,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "rect" ? 2 : 0,
            background: p.shape === "star" ? "none" : p.color,
            color: p.color,
            fontSize: p.shape === "star" ? p.size * 1.4 : undefined,
            lineHeight: 1,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        >
          {p.shape === "star" ? "✦" : null}
        </div>
      ))}
    </div>
  );
}

// ── Avatar with gold ring ───────────────────────────────────────
function RingAvatar({ src, name, size = 100, delay = "0s" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: src ? `url(${src}) center/cover` : `linear-gradient(135deg, ${NAVY}, #1e4a8a)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: WHITE, fontWeight: 800, fontSize: size * 0.36,
      fontFamily: HF,
      border: `3px solid ${GOLD}`,
      boxShadow: `0 0 0 4px rgba(245,158,11,0.25), 0 0 28px rgba(245,158,11,0.5), 0 8px 32px rgba(0,0,0,0.6)`,
      animation: `avatarPop 0.55s ${delay} cubic-bezier(0.175, 0.885, 0.32, 1.275) both`,
    }}>
      {!src && (name?.[0]?.toUpperCase() || "?")}
    </div>
  );
}

// ── Match Celebration Modal ─────────────────────────────────────
function MatchCelebrationModal({ matchedUser, currentUser, onMessage, onKeepSwiping }) {
  const [visible, setVisible] = useState(false);

  // Lock body scroll + entrance animation
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Trigger entrance on next frame
    requestAnimationFrame(() => setVisible(true));
    return () => { document.body.style.overflow = prev; };
  }, []);

  const firstName = matchedUser.name?.split(" ")[0] || matchedUser.name || "them";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 600,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 30%, rgba(15,45,94,0.98) 0%, rgba(3,9,20,0.98) 70%)",
      backdropFilter: "blur(12px)",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.35s ease",
      padding: "20px 16px",
      overflow: "hidden",
    }}>
      {/* Confetti rain */}
      <Confetti />

      {/* Glow orbs behind content */}
      <div style={{
        position: "absolute", width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%, -55%)",
        pointerEvents: "none",
      }} />

      {/* ── Content card ── */}
      <div style={{
        position: "relative", zIndex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", maxWidth: 420, width: "100%",
        textAlign: "center",
      }}>

        {/* Badge */}
        <div style={{
          background: "rgba(245,158,11,0.12)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 100, padding: "6px 20px", marginBottom: 32,
          animation: "fadeSlideDown 0.5s 0.1s both",
        }}>
          <span style={{ fontFamily: BF, fontSize: "0.75rem", fontWeight: 700, color: GOLD, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            New Match
          </span>
        </div>

        {/* Avatars side by side */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          marginBottom: 36,
          animation: "fadeSlideDown 0.5s 0.15s both",
        }}>
          <RingAvatar src={currentUser?.photo} name={currentUser?.first_name || currentUser?.name} size={96} delay="0.2s" />

          {/* Heart connector */}
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_D})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.3rem",
            boxShadow: `0 0 24px rgba(245,158,11,0.6), 0 4px 16px rgba(0,0,0,0.4)`,
            zIndex: 2, flexShrink: 0,
            margin: "0 -8px",
            animation: "heartPulse 1.2s 0.6s ease-in-out infinite",
          }}>
            ♥
          </div>

          <RingAvatar src={matchedUser.photo} name={firstName} size={96} delay="0.35s" />
        </div>

        {/* "It's a Match!" */}
        <div style={{ animation: "fadeSlideDown 0.6s 0.3s both" }}>
          <h1 style={{
            fontFamily: HF, fontWeight: 900, margin: "0 0 10px",
            fontSize: "clamp(2.4rem, 8vw, 3.2rem)",
            letterSpacing: "-0.03em",
            background: `linear-gradient(135deg, ${WHITE} 0%, ${GOLD} 60%, ${GOLD_D} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.05,
          }}>
            It's a Match!
          </h1>
          <p style={{
            fontFamily: BF, color: "rgba(255,255,255,0.65)",
            fontSize: "1rem", lineHeight: 1.6, margin: "0 0 6px",
          }}>
            You and <span style={{ color: WHITE, fontWeight: 700 }}>{firstName}</span> liked each other.
          </p>
          <p style={{
            fontFamily: BF, color: "rgba(255,255,255,0.38)",
            fontSize: "0.85rem", margin: 0,
          }}>
            Start a conversation and find your perfect Room8.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 12,
          width: "100%", marginTop: 36,
          animation: "fadeSlideDown 0.6s 0.45s both",
        }}>
          <button
            onClick={onMessage}
            style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_D} 100%)`,
              color: DARK, border: "none",
              padding: "15px 28px", borderRadius: 12,
              fontWeight: 800, fontSize: "1rem",
              cursor: "pointer", fontFamily: HF,
              boxShadow: "0 6px 28px rgba(245,158,11,0.5), 0 2px 8px rgba(0,0,0,0.3)",
              letterSpacing: "0.01em",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(245,158,11,0.55), 0 4px 12px rgba(0,0,0,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 28px rgba(245,158,11,0.5), 0 2px 8px rgba(0,0,0,0.3)"; }}
          >
            💬 Send a Message
          </button>

          <button
            onClick={onKeepSwiping}
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.75)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              padding: "14px 28px", borderRadius: 12,
              fontWeight: 600, fontSize: "0.95rem",
              cursor: "pointer", fontFamily: BF,
              backdropFilter: "blur(8px)",
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; e.currentTarget.style.color = WHITE; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
          >
            Keep Swiping
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes avatarPop {
          from { opacity: 0; transform: scale(0.55); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.18); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────
export default function LikesPage() {
  const navigate = useNavigate();
  const user     = getCurrentUser();

  const [fans,        setFans]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [liking,      setLiking]      = useState({});
  const [matched,     setMatched]     = useState({});
  const [matchModal,  setMatchModal]  = useState(null); // { fan } | null
  const [matchesList, setMatchesList] = useState([]);

  const fetchData = useCallback(() => {
    return Promise.all([getLikes(user.id), getMatches(user.id)])
      .then(([likes, matchData]) => {
        const matchedIds = new Set((matchData || []).map((m) => m.id));
        // Preserve any locally-matched fans so they don't reappear
        setFans((prev) => {
          const locallyMatched = new Set(Object.keys(matched).map(Number));
          return (Array.isArray(likes) ? likes : []).filter(
            (f) => !matchedIds.has(f.id) && !locallyMatched.has(f.id)
          );
        });
        setMatchesList(Array.isArray(matchData) ? matchData : []);
      })
      .catch(console.error);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchData().finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // Poll every 30 seconds to refresh liked-you list
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => { fetchData(); }, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleLikeBack = async (fan) => {
    if (liking[fan.id]) return;
    setLiking((prev) => ({ ...prev, [fan.id]: true }));
    try {
      const res = await likeUser(user.id, fan.id);
      if (res?.matched) {
        setMatched((prev) => ({ ...prev, [fan.id]: true }));
        setMatchModal({ fan });   // open celebration modal — no auto-navigate
        sendNotification(
          "You have a new match on Room8!",
          `You and ${fan.name?.split(" ")[0] || "someone"} liked each other.`
        );
      }
    } catch (e) { console.error(e); }
    finally { setLiking((prev) => ({ ...prev, [fan.id]: false })); }
  };

  const handleMessage = () => {
    const fan = matchModal?.fan;
    if (fan) setFans((prev) => prev.filter((f) => f.id !== fan.id));
    setMatchModal(null);
    // Pass the matched user's id so MessagesPage can auto-open that conversation.
    navigate("/messages", { state: { openUserId: fan?.id } });
  };

  const handleKeepSwiping = () => {
    // Remove matched fan from the likes list, close modal, stay on Likes
    if (matchModal?.fan) {
      setFans((prev) => prev.filter((f) => f.id !== matchModal.fan.id));
    }
    setMatchModal(null);
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: `linear-gradient(180deg, ${DARKER} 0%, #071020 100%)`,
      overflowY: "auto",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* Header */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: "20px 24px",
          marginBottom: 20,
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.3rem",
            }}>♥</div>
            <div>
              <h2 style={{
                margin: 0, fontFamily: HF, fontWeight: 800,
                fontSize: "1.4rem", color: GOLD,
                letterSpacing: "-0.025em",
              }}>
                Liked You
              </h2>
              <p style={{ color: MUTED, fontSize: "0.83rem", margin: 0, fontFamily: BF }}>
                {fans.length > 0
                  ? `${fans.length} student${fans.length !== 1 ? "s" : ""} want${fans.length === 1 ? "s" : ""} to be your Room8`
                  : "Keep swiping — likes will appear here"}
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <Spinner />
          </div>
        )}

        {/* Empty */}
        {!loading && fans.length === 0 && (
          <div style={{
            textAlign: "center",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: "60px 28px",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: "2.2rem",
            }}>♥</div>
            <p style={{ color: WHITE, fontFamily: HF, fontWeight: 700, fontSize: "1.1rem", marginBottom: 10 }}>
              No likes yet
            </p>
            <p style={{ color: MUTED, fontSize: "0.88rem", fontFamily: BF, maxWidth: 260, margin: "0 auto 28px" }}>
              Keep swiping — when someone likes you, they'll show up here.
            </p>
            <button onClick={() => navigate("/app")} style={{
              background: GOLD, color: DARK, border: "none",
              padding: "13px 30px", borderRadius: 10, fontWeight: 800,
              cursor: "pointer", fontSize: "0.92rem", fontFamily: HF,
              boxShadow: "0 6px 24px rgba(245,158,11,0.35)",
            }}>
              Start Swiping →
            </button>
          </div>
        )}

        {/* Grid of fans */}
        {!loading && fans.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, calc(50% - 8px)), 1fr))",
            gap: 14,
          }}>
            {fans.map((fan) => (
              <FanCard
                key={fan.id}
                fan={fan}
                liking={!!liking[fan.id]}
                isMatched={!!matched[fan.id]}
                onLikeBack={() => handleLikeBack(fan)}
              />
            ))}
          </div>
        )}

        {/* ── Your Matches section ── */}
        {!loading && matchesList.length > 0 && (
          <div style={{ marginTop: 32 }}>
            {/* Section header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${BORDER}`,
              borderRadius: 16, padding: "16px 20px",
              marginBottom: 16,
              backdropFilter: "blur(12px)",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.15rem", flexShrink: 0,
              }}>💬</div>
              <div>
                <h2 style={{
                  margin: 0, fontFamily: HF, fontWeight: 800,
                  fontSize: "1.25rem", color: "#86efac",
                  letterSpacing: "-0.025em",
                }}>
                  Your Matches
                </h2>
                <p style={{ color: MUTED, fontSize: "0.82rem", margin: 0, fontFamily: BF }}>
                  {matchesList.length} mutual match{matchesList.length !== 1 ? "es" : ""} — say hello!
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {matchesList.map((m) => (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14, padding: "14px 16px",
                  transition: "border-color 0.2s",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                    background: m.photo ? `url(${m.photo}) center/cover` : `linear-gradient(135deg, ${NAVY}, #1e4a8a)`,
                    border: `2.5px solid rgba(134,239,172,0.5)`,
                    boxShadow: "0 0 12px rgba(34,197,94,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: WHITE, fontWeight: 800, fontSize: "1.3rem",
                  }}>
                    {!m.photo && (m.name?.[0]?.toUpperCase() || "?")}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, color: WHITE, fontWeight: 700, fontSize: "0.95rem", fontFamily: HF }}>
                      {m.name?.split(" ")[0]}{m.age ? `, ${m.age}` : ""}
                    </p>
                    {(m.class_year || m.major) && (
                      <p style={{ margin: "2px 0 0", color: MUTED, fontSize: "0.76rem", fontFamily: BF, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {[m.class_year, m.major].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {m.last_message && (
                      <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.35)", fontSize: "0.74rem", fontFamily: BF, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {m.last_message_mine ? "You: " : ""}{m.last_message}
                      </p>
                    )}
                  </div>

                  {/* Message button */}
                  <button
                    onClick={() => navigate("/messages", { state: { openUserId: m.id } })}
                    style={{
                      background: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(34,197,94,0.35)",
                      color: "#86efac",
                      padding: "9px 16px", borderRadius: 10,
                      fontWeight: 700, fontSize: "0.82rem",
                      cursor: "pointer", fontFamily: HF, flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(34,197,94,0.25)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(34,197,94,0.15)"}
                  >
                    💬 Message
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Match celebration modal */}
      {matchModal && (
        <MatchCelebrationModal
          matchedUser={matchModal.fan}
          currentUser={user}
          onMessage={handleMessage}
          onKeepSwiping={handleKeepSwiping}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FanCard({ fan, liking, isMatched, onLikeBack }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${hov ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.09)"}`,
        borderRadius: 16, overflow: "hidden",
        display: "flex", flexDirection: "column",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? "0 12px 40px rgba(0,0,0,0.3)" : "none",
        transition: "all 0.2s",
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative", paddingBottom: "115%", flexShrink: 0 }}>
        {fan.photo ? (
          <img
            src={fan.photo} alt={fan.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${NAVY}, #1e4a8a)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "3rem", opacity: 0.6,
          }}>
            👤
          </div>
        )}
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(3,9,20,0.92) 0%, rgba(3,9,20,0.4) 45%, transparent 70%)",
        }} />
        {/* Name on photo */}
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
          <div style={{ color: WHITE, fontWeight: 800, fontSize: "1.05rem", fontFamily: HF }}>
            {fan.name?.split(" ")[0]}{fan.age ? `, ${fan.age}` : ""}
          </div>
          {fan.school && (
            <div style={{
              color: "rgba(245,158,11,0.85)", fontSize: "0.68rem",
              fontWeight: 600, marginTop: 3, fontFamily: BF,
            }}>
              {fan.school.split("(")[0].trim().slice(0, 24)}
            </div>
          )}
        </div>
      </div>

      {/* Bottom info + action */}
      <div style={{ padding: "12px 12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        {(fan.class_year || fan.major) && (
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.74rem", margin: 0, fontWeight: 600, fontFamily: BF }}>
            {[fan.class_year, fan.major].filter(Boolean).join(" · ")}
          </p>
        )}
        {fan.bio && (
          <p style={{
            color: MUTED, fontSize: "0.78rem", margin: 0, lineHeight: 1.4, fontFamily: BF,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {fan.bio}
          </p>
        )}

        {isMatched ? (
          <div style={{
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#86efac",
            padding: "10px", borderRadius: 10,
            fontWeight: 700, fontSize: "0.82rem",
            textAlign: "center", marginTop: "auto",
            fontFamily: HF,
          }}>
            🎉 Matched!
          </div>
        ) : (
          <button
            onClick={onLikeBack}
            disabled={liking}
            style={{
              background: liking ? "rgba(245,158,11,0.4)" : GOLD,
              color: liking ? "rgba(5,13,31,0.5)" : DARK,
              border: "none",
              padding: "11px", borderRadius: 10, fontWeight: 800,
              fontSize: "0.85rem", cursor: liking ? "default" : "pointer",
              marginTop: "auto", fontFamily: HF,
              boxShadow: liking ? "none" : "0 4px 16px rgba(245,158,11,0.35)",
              transition: "all 0.15s",
            }}
          >
            {liking ? "…" : "♥ Like Back"}
          </button>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 36, height: 36,
      border: "2.5px solid rgba(255,255,255,0.1)",
      borderTop: `2.5px solid ${GOLD}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
  );
}
