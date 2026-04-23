import React, { useState, useEffect, useRef } from "react";
import TinderCard from "react-tinder-card";
import { getCurrentUser, getCandidates, likeUser, skipUser, reportUser, blockUser } from "../api";

const NAVY  = "#0F2D5E";
const GOLD  = "#F59E0B";
const GOLD_D = "#D97706";
const DARK  = "#050D1F";
const DARKER = "#030914";
const WHITE = "#FFFFFF";
const MUTED = "rgba(255,255,255,0.5)";
const BORDER = "rgba(255,255,255,0.1)";

// ── Compatibility helpers ──────────────────────────────────────
const COMPAT_LABELS = {
  sleep_schedule: { icon: "😴", label: "Sleep" },
  cleanliness:    { icon: "🧹", label: "Cleanliness" },
  study_habits:   { icon: "📚", label: "Study" },
  guests:         { icon: "👥", label: "Guests" },
  noise:          { icon: "🔊", label: "Noise" },
  social:         { icon: "😊", label: "Social" },
  partying:       { icon: "🎉", label: "Party" },
  smoking:        { icon: "🚬", label: "Smoking" },
};

const TOTAL_PREFS = Object.keys(COMPAT_LABELS).length;

function getCompatPercent(myPrefs, theirPrefs) {
  if (!myPrefs || !theirPrefs) return null;
  const myKeys = Object.keys(myPrefs).filter((k) => COMPAT_LABELS[k] && myPrefs[k]);
  if (myKeys.length === 0) return null;
  const matching = myKeys.filter((k) => theirPrefs[k] && myPrefs[k] === theirPrefs[k]).length;
  return Math.round((matching / TOTAL_PREFS) * 100);
}

function getCompatTags(myPrefs, theirPrefs) {
  if (!myPrefs || !theirPrefs) return [];
  return Object.keys(COMPAT_LABELS)
    .filter((k) => myPrefs[k] && myPrefs[k] === theirPrefs[k])
    .slice(0, 3)
    .map((k) => ({ ...COMPAT_LABELS[k], key: k }));
}

const SLEEP_LABELS = {
  early_bird: "Early Bird",
  night_owl:  "Night Owl",
  flexible:   "Flexible",
};
const CLEAN_LABELS = {
  very_clean: "Spotless",
  clean:      "Clean",
  relaxed:    "Relaxed",
  messy:      "Casual",
};

function shortSchool(name) {
  if (!name) return null;
  const aliases = {
    "New York University (NYU)": "NYU",
    "Massachusetts Institute of Technology": "MIT",
  };
  return aliases[name] || (name.length > 26 ? name.slice(0, 24) + "…" : name);
}

// ── Report modal ───────────────────────────────────────────────
const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "fake",          label: "Fake profile" },
  { value: "harassment",    label: "Harassment" },
  { value: "spam",          label: "Spam" },
  { value: "other",         label: "Other" },
];

function ReportModal({ person, userId, onClose, onDone }) {
  const [reason,     setReason]     = useState("inappropriate");
  const [notes,      setNotes]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await reportUser(userId, person.id, reason, notes);
      setDone(true);
      setTimeout(onDone, 1200);
    } catch (e) {
      console.error(e);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      backdropFilter: "blur(8px)",
    }} onClick={onClose}>
      <div style={{
        background: "#0A1628",
        borderRadius: "20px 20px 0 0",
        padding: "28px 24px 40px", width: "100%", maxWidth: 480,
        border: `1px solid ${BORDER}`,
      }} onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
            <p style={{ color: WHITE, fontWeight: 700 }}>Report submitted</p>
            <p style={{ color: MUTED, fontSize: "0.88rem" }}>We'll review this profile shortly.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ color: WHITE, fontWeight: 800, margin: 0 }}>
                Report {person.name?.split(" ")[0]}
              </h3>
              <button onClick={onClose} style={{
                background: "rgba(255,255,255,0.08)", border: "none", color: WHITE,
                width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: "1rem",
              }}>✕</button>
            </div>

            <p style={{ color: MUTED, fontSize: "0.85rem", marginBottom: 16 }}>Why are you reporting this profile?</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {REPORT_REASONS.map((r) => (
                <button key={r.value} onClick={() => setReason(r.value)} style={{
                  padding: "12px 16px", borderRadius: 8, textAlign: "left",
                  background: reason === r.value ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${reason === r.value ? GOLD : BORDER}`,
                  color: reason === r.value ? GOLD : MUTED,
                  fontWeight: reason === r.value ? 700 : 400,
                  cursor: "pointer", fontSize: "0.9rem",
                }}>
                  {r.label}
                </button>
              ))}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details (optional)…"
              rows={2}
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)",
                border: `1.5px solid ${BORDER}`, borderRadius: 8,
                color: WHITE, padding: "10px 14px", fontSize: "0.88rem",
                fontFamily: "inherit", resize: "none", outline: "none",
                boxSizing: "border-box", marginBottom: 18,
              }}
            />

            <button onClick={handleSubmit} disabled={submitting} style={{
              width: "100%", padding: "13px",
              background: submitting ? "rgba(245,158,11,0.5)" : GOLD,
              color: DARK, border: "none", borderRadius: 8,
              fontWeight: 700, fontSize: "0.95rem",
              cursor: submitting ? "default" : "pointer",
            }}>
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Profile card ───────────────────────────────────────────────
function ProfileCard({ person, viewerPrefs, onReport }) {
  const theirPrefs  = person.dorm_prefs || {};
  const compatTags  = getCompatTags(viewerPrefs, theirPrefs);
  const compatPct   = getCompatPercent(viewerPrefs, theirPrefs);

  return (
    <div style={{
      position: "absolute", width: "100%", height: "100%",
      borderRadius: 22, overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
      background: person.photo ? "transparent" : "#0A1628",
      userSelect: "none",
    }}>
      {/* Photo — full bleed */}
      {person.photo && (
        <img
          src={person.photo} alt={person.name} draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {/* Placeholder when no photo */}
      {!person.photo && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #0A1628 0%, #0F2D5E 100%)",
        }}>
          <span style={{ fontSize: "5rem", opacity: 0.2 }}>👤</span>
        </div>
      )}

      {/* Gradient overlay — stronger at bottom */}
      <div style={{
        position: "absolute", inset: 0,
        background: person.photo
          ? "linear-gradient(to top, rgba(3,9,20,0.96) 0%, rgba(3,9,20,0.6) 40%, rgba(3,9,20,0.1) 65%, rgba(3,9,20,0) 100%)"
          : "transparent",
      }} />

      {/* Compatibility badge — top left */}
      {compatPct !== null && (
        <div style={{
          position: "absolute", top: 14, left: 14, zIndex: 10,
          background: "rgba(3,9,20,0.75)",
          backdropFilter: "blur(8px)",
          border: `1px solid rgba(245,158,11,0.5)`,
          borderRadius: 10,
          padding: "5px 12px",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ fontSize: "0.7rem" }}>⭐</span>
          <span style={{
            color: GOLD, fontWeight: 800, fontSize: "0.92rem",
            textShadow: `0 0 10px rgba(245,158,11,0.6)`,
          }}>
            {compatPct}%
          </span>
          <span style={{ color: "rgba(245,158,11,0.7)", fontSize: "0.65rem", fontWeight: 600 }}>match</span>
        </div>
      )}

      {/* Report button — top right */}
      <button
        onClick={(e) => { e.stopPropagation(); onReport(); }}
        style={{
          position: "absolute", top: 14, right: 14, zIndex: 10,
          background: "rgba(3,9,20,0.6)", border: `1px solid ${BORDER}`,
          color: WHITE, width: 34, height: 34, borderRadius: "50%",
          cursor: "pointer", fontSize: "1rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(6px)",
        }}
        title="Report or block"
      >
        ⋯
      </button>

      {/* Info overlay — bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "24px 20px 22px",
      }}>
        {/* Name + age */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <h2 style={{
            margin: 0, color: WHITE,
            fontSize: "clamp(1.6rem, 6vw, 2rem)",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}>
            {person.name}
          </h2>
          {person.age && (
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.3rem", fontWeight: 400 }}>
              {person.age}
            </span>
          )}
        </div>

        {/* Class year + major */}
        {(person.class_year || person.major) && (
          <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.65)", fontSize: "0.87rem", fontWeight: 500 }}>
            {[person.class_year, person.major].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Quick tags row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {person.dorm_prefs?.sleep_schedule && SLEEP_LABELS[person.dorm_prefs.sleep_schedule] && (
            <span style={tagStyle}>{SLEEP_LABELS[person.dorm_prefs.sleep_schedule]}</span>
          )}
          {person.dorm_prefs?.cleanliness && CLEAN_LABELS[person.dorm_prefs.cleanliness] && (
            <span style={tagStyle}>{CLEAN_LABELS[person.dorm_prefs.cleanliness]}</span>
          )}
          {person.school && (
            <span style={{ ...tagStyle, borderColor: "rgba(245,158,11,0.4)", color: "rgba(245,158,11,0.9)" }}>
              {shortSchool(person.school)}
            </span>
          )}
          {person.room_type && person.room_type !== "any" && (
            <span style={tagStyle}>
              {person.room_type.charAt(0).toUpperCase() + person.room_type.slice(1)}
            </span>
          )}
        </div>

        {/* Compat tags */}
        {compatTags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {compatTags.map((t) => (
              <span key={t.key} style={{
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.35)",
                color: "#86efac",
                padding: "3px 9px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 600,
              }}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {person.bio && (
          <p style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.83rem",
            lineHeight: 1.5, margin: 0,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {person.bio}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main SwipeDeck ─────────────────────────────────────────────
export default function SwipeDeck() {
  const user = getCurrentUser();
  const viewerPrefs = user?.dorm_prefs || {};

  const [candidates,   setCandidates]   = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading,      setLoading]      = useState(true);
  const [matchToast,   setMatchToast]   = useState("");
  const [swipeHint,    setSwipeHint]    = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const toastTimer = useRef(null);

  const loadCandidates = (reset = false) => {
    if (!user) { setLoading(false); return; }
    if (reset) { setCandidates([]); setCurrentIndex(-1); }
    setLoading(true);
    getCandidates(user.id, reset)
      .then((data) => { setCandidates(data); setCurrentIndex(data.length - 1); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCandidates(false); }, []); // eslint-disable-line

  const showToast = (msg) => {
    setMatchToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMatchToast(""), 3500);
  };

  const handleSwipe = async (direction, candidate) => {
    setCurrentIndex((prev) => prev - 1);
    setSwipeHint(null);
    try {
      if (direction === "right") {
        const res = await likeUser(user.id, candidate.id);
        if (res?.matched) showToast(`You matched with ${candidate.name?.split(" ")[0]}! 🎉`);
      } else {
        await skipUser(user.id, candidate.id);
      }
    } catch (err) { console.error("Swipe error:", err); }
  };

  const pressButton = (direction) => {
    if (currentIndex < 0 || currentIndex >= candidates.length) return;
    handleSwipe(direction, candidates[currentIndex]);
  };

  const handleReportDone = () => {
    setReportTarget(null);
    pressButton("left");
  };

  const handleBlock = async (person) => {
    if (!person) return;
    setCurrentIndex((prev) => prev - 1);
    setCandidates((prev) => prev.filter((c) => c.id !== person.id));
    try {
      await blockUser(user.id, person.id);
    } catch (e) { console.error(e); }
  };

  const renderContent = () => {
    if (!user) {
      return (
        <div style={emptyStyle}>
          <p style={{ color: MUTED, fontSize: "1.05rem" }}>Please log in to browse candidates.</p>
        </div>
      );
    }
    if (loading) {
      return (
        <div style={emptyStyle}>
          <div style={spinnerStyle} />
          <p style={{ color: MUTED, marginTop: 16, fontSize: "0.9rem" }}>Finding roommates…</p>
        </div>
      );
    }
    if (!candidates.length || currentIndex < 0) {
      return (
        <div style={emptyStyle}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(245,158,11,0.12)",
            border: `1px solid rgba(245,158,11,0.35)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", marginBottom: 16,
          }}>✓</div>
          <p style={{ color: WHITE, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 8px" }}>
            You've seen everyone!
          </p>
          <p style={{ color: MUTED, fontSize: "0.88rem", marginBottom: 24, textAlign: "center" }}>
            Check back later for new profiles from your campus.
          </p>
          <button onClick={() => loadCandidates(true)} style={{
            background: GOLD, color: DARK, border: "none",
            padding: "12px 28px", borderRadius: 8,
            fontWeight: 700, fontSize: "0.95rem",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
          }}>
            Refresh
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Card stack */}
        <div style={{ position: "relative", width: "min(360px, calc(100vw - 32px))", height: "min(520px, calc(100vh - 220px))" }}>
          {currentIndex > 0 && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: 22,
              background: "linear-gradient(135deg, #0A1628, #0F2D5E)",
              border: `1px solid rgba(255,255,255,0.06)`,
              transform: "scale(0.96) translateY(10px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }} />
          )}
          {candidates.map((person, index) =>
            index === currentIndex ? (
              <TinderCard
                key={person.id}
                onSwipe={(dir) => handleSwipe(dir, person)}
                onCardLeftScreen={() => {}}
                preventSwipe={["up", "down"]}
              >
                <div style={{ position: "relative", width: "min(360px, calc(100vw - 32px))", height: "min(520px, calc(100vh - 220px))" }}>
                  {swipeHint === "right" && (
                    <div style={{ ...hintStyle, borderColor: GOLD, color: GOLD, right: 16, left: "auto" }}>LIKE</div>
                  )}
                  {swipeHint === "left" && (
                    <div style={{ ...hintStyle, borderColor: "#EF4444", color: "#EF4444", left: 16, right: "auto" }}>PASS</div>
                  )}
                  <ProfileCard
                    person={person}
                    viewerPrefs={viewerPrefs}
                    onReport={() => setReportTarget(person)}
                  />
                </div>
              </TinderCard>
            ) : null
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "clamp(20px, 8vw, 44px)", marginTop: 28, alignItems: "center" }}>
          <ActionButton
            onClick={() => pressButton("left")}
            onMouseEnter={() => setSwipeHint("left")}
            onMouseLeave={() => setSwipeHint(null)}
            bg="transparent"
            border="1.5px solid rgba(255,255,255,0.2)"
            hoverBorder="1.5px solid #EF4444"
            shadow="0 4px 20px rgba(0,0,0,0.3)"
            label="✕" labelColor="rgba(255,255,255,0.7)" size={58}
          />
          <ActionButton
            onClick={() => pressButton("right")}
            onMouseEnter={() => setSwipeHint("right")}
            onMouseLeave={() => setSwipeHint(null)}
            bg={GOLD}
            border="none"
            hoverBorder="none"
            shadow={`0 6px 28px rgba(245,158,11,0.5)`}
            label="♥" labelColor={DARK} size={72}
          />
        </div>

        {/* Report / Block row */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            onClick={() => setReportTarget(candidates[currentIndex])}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.5)",
              padding: "7px 16px", borderRadius: 8,
              fontSize: "0.78rem", fontWeight: 600,
              cursor: "pointer", fontFamily: "'Inter', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"; e.currentTarget.style.color = "#F87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >
            Report 🚩
          </button>
          <button
            onClick={() => handleBlock(candidates[currentIndex])}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.5)",
              padding: "7px 16px", borderRadius: 8,
              fontSize: "0.78rem", fontWeight: 600,
              cursor: "pointer", fontFamily: "'Inter', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"; e.currentTarget.style.color = "#F87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >
            Block 🚫
          </button>
        </div>
      </>
    );
  };

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      width: "100%", height: "100%",
      background: `linear-gradient(180deg, ${DARKER} 0%, #071020 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle radial glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(15,45,94,0.4) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "14px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        zIndex: 50,
        background: "rgba(3,9,20,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <span style={{
          fontSize: "1.1rem", fontWeight: 800,
          color: GOLD, letterSpacing: "0.06em",
          fontFamily: "'Outfit', sans-serif",
        }}>
          ROOM8
        </span>
        {user?.school && (
          <span style={{
            background: "rgba(245,158,11,0.12)",
            color: "rgba(245,158,11,0.85)",
            padding: "4px 12px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600,
            border: "1px solid rgba(245,158,11,0.25)",
            maxWidth: "45%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {shortSchool(user.school)}
          </span>
        )}
        {user && (
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: user.photo ? `url(${user.photo}) center/cover` : NAVY,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: WHITE, fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
            border: `2px solid rgba(245,158,11,0.4)`,
          }}>
            {!user.photo && (user.name?.[0]?.toUpperCase() || "?")}
          </div>
        )}
      </div>

      {/* Match toast */}
      {matchToast && (
        <div style={{
          position: "absolute", top: 74, left: "50%", transform: "translateX(-50%)",
          background: GOLD, color: DARK,
          padding: "10px 22px", borderRadius: 8,
          fontWeight: 700, fontSize: "0.9rem", zIndex: 100,
          boxShadow: "0 4px 24px rgba(245,158,11,0.5)",
          animation: "slideDown 0.3s ease", whiteSpace: "nowrap",
        }}>
          {matchToast}
        </div>
      )}

      {renderContent()}

      {/* Report modal */}
      {reportTarget && (
        <ReportModal
          person={reportTarget}
          userId={user.id}
          onClose={() => setReportTarget(null)}
          onDone={handleReportDone}
        />
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ActionButton({ onClick, onMouseEnter, onMouseLeave, bg, border, hoverBorder, shadow, label, labelColor, size }) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); onMouseEnter?.(); }}
      onMouseLeave={() => { setHovered(false); onMouseLeave?.(); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: size, height: size,
        background: bg,
        border: hovered ? hoverBorder : border,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: shadow,
        cursor: "pointer",
        fontSize: size > 65 ? "1.9rem" : "1.4rem",
        color: labelColor,
        transition: "transform 0.15s, box-shadow 0.15s",
        transform: pressed ? "scale(0.88)" : "scale(1)",
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

const emptyStyle = {
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  height: 480, textAlign: "center", padding: 32,
  marginTop: 64,
};

const spinnerStyle = {
  width: 36, height: 36,
  border: "2.5px solid rgba(255,255,255,0.1)",
  borderTop: `2.5px solid ${GOLD}`,
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

const tagStyle = {
  background: "rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.85)",
  padding: "4px 10px", borderRadius: 6,
  fontSize: "0.72rem", fontWeight: 600,
  backdropFilter: "blur(4px)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const hintStyle = {
  position: "absolute", top: 20, zIndex: 10,
  border: "3px solid", borderRadius: 8,
  padding: "5px 12px", fontWeight: 800, fontSize: "1.1rem",
  letterSpacing: 2, transform: "rotate(-12deg)",
  pointerEvents: "none",
};
