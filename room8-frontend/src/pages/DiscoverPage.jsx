// src/pages/DiscoverPage.jsx: "Matches" tab. Compatibility rankings and the campus board.
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCurrentUser,
  getPosts, createPost, togglePostLike, deletePost, getReplies, addReply,
  getCompatibility,
} from "../api";
import Icon from "../ui/Icon";
import { Avatar, EmptyState } from "../ui/kit";
import AppHeader from "../components/AppHeader";

const PREF_LABELS = {
  sleep_schedule: "Sleep", cleanliness: "Cleanliness", study_habits: "Study", guests: "Guests",
  noise: "Noise", social: "Social", partying: "Parties", smoking: "Smoking",
};

function relTime(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}

// ─── Campus board ─────────────────────────────────────────────────
function PostCard({ post, userId, onLikeToggle, onReplyAdded, onDelete }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingRep, setLoadingRep] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const loadReplies = async () => {
    if (showReplies) { setShowReplies(false); return; }
    setLoadingRep(true);
    try { const data = await getReplies(post.id); setReplies(Array.isArray(data) ? data : []); setShowReplies(true); }
    catch (e) { console.error(e); } finally { setLoadingRep(false); }
  };
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try { const res = await addReply(userId, post.id, replyText.trim()); setReplies((p) => [...p, res.reply]); setReplyText(""); onReplyAdded(post.id); }
    catch (e) { console.error(e); } finally { setSending(false); }
  };

  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="r8-card" style={{ padding: 18, borderRadius: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <Avatar src={post.author_photo} name={post.author_name} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 15 }}>{post.author_name}</p>
          <p className="r8-faint" style={{ fontSize: 12.5 }}>{[post.author_school?.split("(")[0].trim(), relTime(post.created_at)].filter(Boolean).join(", ")}</p>
        </div>
        {post.user_id === userId && (
          <button className="r8-icon-btn r8-icon-btn--round" style={{ width: 36, height: 36, background: "transparent", borderColor: "transparent" }} onClick={() => onDelete(post.id)} aria-label="Delete post"><Icon name="trash" size={17} color="var(--text-3)" /></button>
        )}
      </div>
      <p style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 14, whiteSpace: "pre-wrap" }}>{post.content}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onLikeToggle(post.id)} className="r8-chip" style={{ cursor: "pointer", height: 34, ...(post.liked_by_me ? { background: "var(--iri-soft)", borderColor: "rgba(140,158,255,.5)" } : {}) }} aria-pressed={!!post.liked_by_me}>
          <Icon name="heart" size={16} fill={post.liked_by_me ? "currentColor" : "none"} />{post.like_count > 0 ? post.like_count : "Like"}
        </motion.button>
        <button onClick={loadReplies} className="r8-chip" style={{ cursor: "pointer", height: 34 }}>
          <Icon name="chat" size={16} />{loadingRep ? "Loading" : showReplies ? "Hide replies" : post.reply_count > 0 ? `${post.reply_count} ${post.reply_count === 1 ? "reply" : "replies"}` : "Reply"}
        </button>
      </div>
      <AnimatePresence>
        {showReplies && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
              {replies.map((r) => (
                <div key={r.id} style={{ display: "flex", gap: 10 }}>
                  <Avatar src={r.author_photo} name={r.author_name} size={30} />
                  <div style={{ flex: 1, background: "var(--glass)", border: "1px solid var(--line)", borderRadius: "6px 18px 18px 18px", padding: "8px 12px" }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{r.author_name} <span className="r8-faint" style={{ fontWeight: 400 }}>{relTime(r.created_at)}</span></p>
                    <p style={{ fontSize: 14.5, lineHeight: 1.45 }}>{r.content}</p>
                  </div>
                </div>
              ))}
              <form onSubmit={handleReply} style={{ display: "flex", gap: 8 }}>
                <input className="r8-input" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply" maxLength={300} aria-label="Reply" style={{ minHeight: 44, borderRadius: 999 }} />
                <button type="submit" disabled={sending || !replyText.trim()} className="r8-btn r8-btn--primary r8-btn--sm" style={{ height: 44 }}>{sending ? "Sending" : "Send"}</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function CommunityBoard({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [posting, setPosting] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    getPosts(user.id).then((d) => setPosts(Array.isArray(d) ? d : [])).catch(console.error).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setPosting(true);
    try { const res = await createPost(user.id, newText.trim()); setPosts((p) => [res.post, ...p]); setNewText(""); textRef.current?.blur(); }
    catch (e) { console.error(e); } finally { setPosting(false); }
  };
  const handleLikeToggle = async (postId) => {
    try { const res = await togglePostLike(user.id, postId); setPosts((p) => p.map((x) => x.id === postId ? { ...x, liked_by_me: res.liked, like_count: res.like_count } : x)); }
    catch (e) { console.error(e); }
  };
  const handleReplyAdded = (postId) => setPosts((p) => p.map((x) => x.id === postId ? { ...x, reply_count: x.reply_count + 1 } : x));
  const handleDelete = async (postId) => {
    try { await deletePost(postId); setPosts((p) => p.filter((x) => x.id !== postId)); } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <form onSubmit={handlePost} className="r8-card" style={{ padding: 16, borderRadius: 24 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Avatar src={user.photo} name={user.name} size={42} />
          <textarea ref={textRef} value={newText} onChange={(e) => setNewText(e.target.value)} maxLength={500} rows={3} aria-label="New post"
            placeholder="ask your campus anything. 'anyone need a roommate for spring?'" className="r8-textarea" style={{ minHeight: 88, border: "none", background: "transparent", padding: "10px 0", resize: "none", boxShadow: "none" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontSize: 12.5, color: newText.length > 450 ? "var(--danger)" : "var(--text-3)" }}>{newText.length}/500</span>
          <button type="submit" disabled={posting || !newText.trim()} className="r8-btn r8-btn--primary r8-btn--sm">{posting ? "Posting" : "Post"}</button>
        </div>
      </form>
      {loading ? (
        [0, 1].map((i) => <div key={i} className="r8-skel" style={{ height: 140, borderRadius: 24 }} />)
      ) : posts.length === 0 ? (
        <div className="r8-card"><EmptyState icon="chat" title="Quiet in here" body="Be the first to post to your campus." /></div>
      ) : (
        <AnimatePresence>
          {posts.map((post) => <PostCard key={post.id} post={post} userId={user.id} onLikeToggle={handleLikeToggle} onReplyAdded={handleReplyAdded} onDelete={handleDelete} />)}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Compatibility ────────────────────────────────────────────────
function Ring({ value, size = 64 }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <defs><linearGradient id="r8-ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#45D9FF" /><stop offset=".5" stopColor="#8C9EFF" /><stop offset="1" stopColor="#FF5FA0" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line-2)" strokeWidth="6" fill="none" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke="url(#r8-ring)" strokeWidth="6" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ type: "spring", stiffness: 60, damping: 18 }} />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 700, fontSize: size * 0.26, letterSpacing: "-0.03em" }}>{value}%</span>
    </div>
  );
}

function CompatCard({ match, index }) {
  const navigate = useNavigate();
  return (
    <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28, delay: Math.min(index, 8) * 0.05 }}
      className="r8-card" style={{ padding: 18, borderRadius: 24 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <Avatar src={match.photo} name={match.name} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>{match.name}{match.age ? <span className="r8-muted" style={{ fontWeight: 500 }}>, {match.age}</span> : null}</p>
          {(match.class_year || match.major) && <p className="r8-muted" style={{ fontSize: 13.5 }}>{[match.class_year, match.major].filter(Boolean).join(", ")}</p>}
        </div>
        <Ring value={match.compatibility} />
      </div>
      {(match.matching_prefs?.length > 0 || match.mismatching_prefs?.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {(match.matching_prefs || []).slice(0, 4).map((k) => (
            <span key={k} className="r8-badge" style={{ color: "var(--success)", background: "rgba(61,220,151,.10)", borderColor: "rgba(61,220,151,.28)" }}><Icon name="check" size={13} stroke={2.4} />{PREF_LABELS[k] || k}</span>
          ))}
          {(match.mismatching_prefs || []).slice(0, 2).map((k) => (
            <span key={k} className="r8-badge"><Icon name="x" size={13} stroke={2.2} />{PREF_LABELS[k] || k}</span>
          ))}
        </div>
      )}
      {match.looking_for && <p className="r8-muted" style={{ fontSize: 14.5, lineHeight: 1.5, marginTop: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>"{match.looking_for}"</p>}
      <button className="r8-btn r8-btn--glass r8-btn--sm r8-btn--block" style={{ marginTop: 14 }} onClick={() => navigate("/messages", { state: { openUserId: match.id } })}><Icon name="chat" size={17} />Message {match.name?.split(" ")[0]}</button>
    </motion.article>
  );
}

function CompatibilityTab({ user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPrefs, setHasPrefs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setHasPrefs(Object.values(user.dorm_prefs || {}).some(Boolean));
    getCompatibility(user.id).then((d) => setMatches(Array.isArray(d) ? d : [])).catch(console.error).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[0, 1, 2].map((i) => <div key={i} className="r8-skel" style={{ height: 150, borderRadius: 24 }} />)}</div>;
  if (!hasPrefs) return <div className="r8-card"><EmptyState icon="sliders" title="Tell us how you live" body="Answer a few lifestyle questions and we'll rank your matches by how well you'd actually live together." action={<button className="r8-btn r8-btn--primary" onClick={() => navigate("/profile")}>Add my preferences</button>} /></div>;
  if (matches.length === 0) return <div className="r8-card"><EmptyState icon="compass" title="No matches yet" body="Once you match with people, we'll rank them by lifestyle fit right here." action={<button className="r8-btn r8-btn--primary" onClick={() => navigate("/app")}><Icon name="flame" size={20} />Start swiping</button>} /></div>;

  const avg = Math.round(matches.reduce((s, m) => s + m.compatibility, 0) / matches.length);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="r8-card" style={{ padding: 18, borderRadius: 24, display: "flex", alignItems: "center", gap: 16, background: "var(--iri-soft)" }}>
        <Ring value={avg} size={72} />
        <div>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{matches.length} {matches.length === 1 ? "match" : "matches"}, ranked by fit</p>
          <p className="r8-muted" style={{ fontSize: 13.5 }}>Your average lifestyle match. Based on sleep, cleanliness, noise, guests and more.</p>
        </div>
      </div>
      {matches.map((m, i) => <CompatCard key={m.id} match={m} index={i} />)}
    </div>
  );
}

export default function DiscoverPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [tab, setTab] = useState("compat");

  useEffect(() => { if (!user) navigate("/login"); }, []); // eslint-disable-line
  if (!user) return null;

  return (
    <div className="r8-app-page" style={{ position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="r8-aura r8-aura--b" style={{ width: 380, height: 380, top: -200, right: -160 }} />
      <AppHeader />
      <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>
        <div className="r8-seg" role="tablist" style={{ marginBottom: 16 }}>
          {[{ key: "compat", label: "Best fit" }, { key: "board", label: "Campus board" }].map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} aria-pressed={tab === t.key} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: tab === "board" ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            {tab === "board" ? <CommunityBoard user={user} /> : <CompatibilityTab user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
