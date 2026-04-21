// src/pages/DiscoverPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser, likeUser,
  getPosts, createPost, togglePostLike, getReplies, addReply,
  getCompatibility,
} from "../api";

const NAVY   = "#0F2D5E";
const GOLD   = "#F59E0B";
const DARK   = "#050D1F";
const DARKER = "#030914";
const WHITE  = "#FFFFFF";
const BORDER = "rgba(255,255,255,0.09)";
const SURFACE = "rgba(255,255,255,0.05)";
const MUTED  = "rgba(255,255,255,0.45)";
const TEXT   = "rgba(255,255,255,0.88)";

const PREF_LABELS = {
  sleep_schedule: "Sleep schedule",
  cleanliness:    "Cleanliness",
  study_habits:   "Study habits",
  guests:         "Guests policy",
  noise:          "Noise level",
  social:         "Social vibe",
  partying:       "Party style",
  smoking:        "Smoking",
};

function relTime(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)     return "now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}

function MiniAvatar({ src, name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: src ? `url(${src}) center/cover` : NAVY,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: WHITE, fontWeight: 700, fontSize: size * 0.36,
      border: `2px solid ${BORDER}`,
    }}>
      {!src && (name?.[0]?.toUpperCase() || "?")}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMMUNITY BOARD
// ══════════════════════════════════════════════════════════════

function PostCard({ post, userId, onLikeToggle, onReplyAdded }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies,     setReplies]     = useState([]);
  const [loadingRep,  setLoadingRep]  = useState(false);
  const [replyText,   setReplyText]   = useState("");
  const [sending,     setSending]     = useState(false);

  const loadReplies = async () => {
    if (showReplies) { setShowReplies(false); return; }
    setLoadingRep(true);
    try {
      const data = await getReplies(post.id);
      setReplies(data);
      setShowReplies(true);
    } catch (e) { console.error(e); }
    finally { setLoadingRep(false); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const res = await addReply(userId, post.id, replyText.trim());
      setReplies((prev) => [...prev, res.reply]);
      setReplyText("");
      onReplyAdded(post.id);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: 16, marginBottom: 10,
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
        <MiniAvatar src={post.author_photo} name={post.author_name} size={38} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <span style={{ color: WHITE, fontWeight: 700, fontSize: "0.9rem" }}>{post.author_name}</span>
            {post.author_school && (
              <span style={{ color: MUTED, fontSize: "0.73rem" }}>{post.author_school.split("(")[0].trim()}</span>
            )}
          </div>
          <span style={{ color: MUTED, fontSize: "0.73rem" }}>{relTime(post.created_at)}</span>
        </div>
      </div>

      <p style={{ color: TEXT, fontSize: "0.95rem", lineHeight: 1.55, margin: "0 0 12px" }}>
        {post.content}
      </p>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <button onClick={() => onLikeToggle(post.id)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          color: post.liked_by_me ? GOLD : MUTED,
          fontSize: "0.85rem", fontWeight: 600, padding: 0,
          transition: "color 0.15s",
        }}>
          <span style={{ fontSize: "1rem" }}>{post.liked_by_me ? "♥" : "♡"}</span>
          {post.like_count > 0 && post.like_count}
        </button>

        <button onClick={loadReplies} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          color: MUTED, fontSize: "0.85rem", fontWeight: 600, padding: 0,
        }}>
          💬 {post.reply_count > 0 ? post.reply_count : ""} {loadingRep ? "…" : showReplies ? "Hide" : "Reply"}
        </button>
      </div>

      {showReplies && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
          {replies.map((r) => (
            <div key={r.id} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <MiniAvatar src={r.author_photo} name={r.author_name} size={28} />
              <div style={{
                background: "rgba(255,255,255,0.04)", borderRadius: 8,
                padding: "7px 12px", flex: 1,
                border: `1px solid ${BORDER}`,
              }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 3 }}>
                  <span style={{ color: WHITE, fontWeight: 700, fontSize: "0.8rem" }}>{r.author_name}</span>
                  <span style={{ color: MUTED, fontSize: "0.7rem" }}>{relTime(r.created_at)}</span>
                </div>
                <p style={{ color: TEXT, fontSize: "0.88rem", margin: 0, lineHeight: 1.45 }}>
                  {r.content}
                </p>
              </div>
            </div>
          ))}

          <form onSubmit={handleReply} style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Add a reply…"
              maxLength={300}
              style={{
                flex: 1, background: "rgba(255,255,255,0.06)",
                border: `1.5px solid ${BORDER}`,
                borderRadius: 8, padding: "8px 12px",
                color: WHITE, fontSize: "0.87rem",
                fontFamily: "inherit", outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
            <button type="submit" disabled={sending || !replyText.trim()} style={{
              background: sending || !replyText.trim() ? "rgba(245,158,11,0.3)" : GOLD,
              color: sending || !replyText.trim() ? "rgba(255,255,255,0.4)" : DARK,
              border: "none",
              padding: "8px 14px", borderRadius: 8, fontWeight: 700,
              fontSize: "0.82rem", cursor: "pointer",
            }}>
              {sending ? "…" : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function CommunityBoard({ user }) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [posting, setPosting] = useState(false);
  const textRef = useRef(null);
  // DARK, DARKER used below via closure

  useEffect(() => {
    getPosts(user.id)
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setPosting(true);
    try {
      const res = await createPost(user.id, newText.trim());
      setPosts((prev) => [res.post, ...prev]);
      setNewText("");
      textRef.current?.blur();
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  };

  const handleLikeToggle = async (postId) => {
    try {
      const res = await togglePostLike(user.id, postId);
      setPosts((prev) => prev.map((p) =>
        p.id === postId
          ? { ...p, liked_by_me: res.liked, like_count: res.like_count }
          : p
      ));
    } catch (e) { console.error(e); }
  };

  const handleReplyAdded = (postId) => {
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, reply_count: p.reply_count + 1 } : p
    ));
  };

  return (
    <div>
      {/* Compose box */}
      <form onSubmit={handlePost} style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${BORDER}`,
        borderRadius: 12, padding: 16, marginBottom: 16,
      }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <MiniAvatar src={user.photo} name={user.name} size={38} />
          <textarea
            ref={textRef}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder='Post to your campus community — "Anyone need a roommate in Brooklyn in May?"'
            maxLength={500}
            rows={3}
            style={{
              flex: 1, background: "rgba(255,255,255,0.06)",
              border: `1.5px solid ${BORDER}`,
              borderRadius: 8, padding: "10px 12px",
              color: WHITE, fontSize: "0.92rem",
              fontFamily: "inherit", outline: "none", resize: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <span style={{ color: newText.length > 450 ? "#F87171" : MUTED, fontSize: "0.73rem" }}>
            {newText.length}/500
          </span>
          <button type="submit" disabled={posting || !newText.trim()} style={{
            background: posting || !newText.trim() ? "rgba(245,158,11,0.25)" : GOLD,
            color: posting || !newText.trim() ? "rgba(255,255,255,0.3)" : DARK,
            border: "none",
            padding: "9px 20px", borderRadius: 8, fontWeight: 700,
            fontSize: "0.88rem", cursor: posting || !newText.trim() ? "default" : "pointer",
            boxShadow: posting || !newText.trim() ? "none" : "0 4px 16px rgba(245,158,11,0.3)",
          }}>
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      {/* Feed */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <Spinner />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
          <p style={{ color: WHITE, fontWeight: 700 }}>No posts yet</p>
          <p style={{ color: MUTED, fontSize: "0.9rem" }}>Be the first to post to your campus!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            userId={user.id}
            onLikeToggle={handleLikeToggle}
            onReplyAdded={handleReplyAdded}
          />
        ))
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPATIBILITY SCORES
// ══════════════════════════════════════════════════════════════

function ScoreBar({ score }) {
  const color = score >= 75 ? "#86efac" : score >= 50 ? GOLD : score >= 25 ? "#FCD34D" : "#F87171";
  const barColor = score >= 75 ? "#22C55E" : score >= 50 ? GOLD : score >= 25 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ color: MUTED, fontSize: "0.73rem", fontWeight: 600 }}>Compatibility</span>
        <span style={{ color, fontWeight: 800, fontSize: "1rem" }}>{score}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3, width: `${score}%`,
          background: barColor,
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

function CompatCard({ match }) {
  const navigate = useNavigate();

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: 16, marginBottom: 10,
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <MiniAvatar src={match.photo} name={match.name} size={50} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: WHITE, fontWeight: 700, fontSize: "1rem" }}>{match.name}</span>
            {match.age && <span style={{ color: MUTED, fontSize: "0.85rem" }}>{match.age}</span>}
          </div>
          {(match.class_year || match.major) && (
            <p style={{ color: "rgba(245,158,11,0.8)", fontSize: "0.78rem", margin: "3px 0 0", fontWeight: 600 }}>
              {[match.class_year, match.major].filter(Boolean).join(" · ")}
            </p>
          )}
          {match.school && (
            <p style={{ color: MUTED, fontSize: "0.74rem", margin: "2px 0 0" }}>{match.school}</p>
          )}
        </div>

        <button onClick={() => navigate("/messages")} style={{
          background: "rgba(245,158,11,0.1)", border: `1px solid rgba(245,158,11,0.25)`,
          color: GOLD, padding: "7px 13px", borderRadius: 8,
          fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap",
        }}>
          Message
        </button>
      </div>

      <ScoreBar score={match.compatibility} />

      {(match.matching_prefs?.length > 0 || match.mismatching_prefs?.length > 0) && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(match.matching_prefs || []).slice(0, 3).map((k) => (
            <span key={k} style={{
              background: "#D1FAE5",
              border: "1px solid #A7F3D0",
              color: "#065F46", fontSize: "0.7rem", fontWeight: 600,
              padding: "3px 8px", borderRadius: 6,
            }}>
              ✓ {PREF_LABELS[k] || k}
            </span>
          ))}
          {(match.mismatching_prefs || []).slice(0, 2).map((k) => (
            <span key={k} style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626", fontSize: "0.7rem", fontWeight: 600,
              padding: "3px 8px", borderRadius: 6,
            }}>
              ✗ {PREF_LABELS[k] || k}
            </span>
          ))}
        </div>
      )}

      {match.looking_for && (
        <p style={{
          color: MUTED, fontSize: "0.82rem", marginTop: 10,
          lineHeight: 1.4, fontStyle: "italic",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          "{match.looking_for}"
        </p>
      )}
    </div>
  );
}

function CompatibilityTab({ user }) {
  const [matches,  setMatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [hasPrefs, setHasPrefs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const myPrefs = user.dorm_prefs || {};
    setHasPrefs(Object.keys(myPrefs).length > 0);

    getCompatibility(user.id)
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spinner /></div>;
  }

  if (!hasPrefs) {
    return (
      <div style={{ textAlign: "center", padding: "50px 20px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🎯</div>
        <p style={{ color: WHITE, fontWeight: 700, fontSize: "1.05rem", marginBottom: 8 }}>
          Set your preferences first
        </p>
        <p style={{ color: MUTED, fontSize: "0.9rem", marginBottom: 24 }}>
          Fill in your roommate preferences on your profile to see compatibility scores.
        </p>
        <button onClick={() => navigate("/profile")} style={{
          background: GOLD, color: DARK, border: "none",
          padding: "12px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
        }}>
          Go to Profile
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "50px 20px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>♥</div>
        <p style={{ color: WHITE, fontWeight: 700, fontSize: "1.05rem" }}>No matches yet</p>
        <p style={{ color: MUTED, fontSize: "0.9rem", marginBottom: 24 }}>
          Start swiping to get matches — then see how compatible you are!
        </p>
        <button onClick={() => navigate("/app")} style={{
          background: GOLD, color: DARK, border: "none",
          padding: "12px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
        }}>
          Start Swiping
        </button>
      </div>
    );
  }

  const avgScore = Math.round(matches.reduce((s, m) => s + m.compatibility, 0) / matches.length);

  return (
    <div>
      <div style={{
        background: "rgba(245,158,11,0.08)",
        border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 12, padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 16,
        marginBottom: 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: GOLD, textShadow: "0 0 16px rgba(245,158,11,0.5)" }}>
            {avgScore}%
          </div>
          <div style={{ color: "rgba(245,158,11,0.6)", fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
            Avg Score
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: WHITE, fontWeight: 700, margin: 0, fontSize: "0.88rem" }}>
            {matches.length} {matches.length === 1 ? "match" : "matches"} ranked by lifestyle fit
          </p>
          <p style={{ color: MUTED, fontSize: "0.76rem", margin: "3px 0 0" }}>
            Based on sleep, cleanliness, noise, social & more
          </p>
        </div>
      </div>

      {matches.map((m) => (
        <CompatCard key={m.id} match={m} userId={user.id} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════

const TABS = [
  { key: "board",  label: "Community Board" },
  { key: "compat", label: "Compatibility"   },
];

export default function DiscoverPage() {
  const navigate = useNavigate();
  const user     = getCurrentUser();
  const [tab, setTab] = useState("board");

  useEffect(() => {
    if (!user) navigate("/login");
  }, []); // eslint-disable-line

  if (!user) return null;

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: `linear-gradient(180deg, ${DARKER} 0%, #071020 100%)`,
      overflowY: "auto", display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(3,9,20,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${BORDER}`,
        padding: "0 20px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{
            margin: "18px 0 14px",
            fontWeight: 800, fontSize: "1.3rem",
            color: WHITE, letterSpacing: "-0.025em",
            fontFamily: "'Outfit', sans-serif",
          }}>
            Discover
          </h2>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, marginBottom: -1 }}>
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "10px 20px",
                background: "none", border: "none",
                borderBottom: `2px solid ${tab === t.key ? GOLD : "transparent"}`,
                color: tab === t.key ? GOLD : MUTED,
                fontWeight: tab === t.key ? 700 : 500,
                fontSize: "0.88rem", cursor: "pointer",
                transition: "all 0.15s",
                marginBottom: -1,
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, maxWidth: 680, margin: "0 auto", width: "100%", padding: "16px 16px 80px" }}>
        {tab === "board"  && <CommunityBoard user={user} />}
        {tab === "compat" && <CompatibilityTab user={user} />}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <>
      <div style={{
        width: 36, height: 36,
        border: "2.5px solid rgba(255,255,255,0.1)",
        borderTop: `2.5px solid ${GOLD}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
