// Discover: physics-based swipe deck. Drag, flick or tap the buttons.
// Tap the sides of a card to flip photos, tap the middle or the info button for the full profile.
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  getCurrentUser, getCandidates, likeUser, skipUser,
  reportUser, blockUser, resendVerification, getSchoolStatus,
} from "../api";
import WaitlistScreen from "./WaitlistScreen";
import ProfileSheet, { photosOf, NoPhoto, RoundAction } from "./ProfileSheet";
import MatchMoment from "./MatchMoment";
import { PhotoVerifiedCheck } from "./VerifiedBadge";
import { haptic } from "../native";
import { sendNotification } from "../notifications";
import Icon, { traitsFor } from "../ui/Icon";
import MatchBadge from "../ui/MatchBadge";
import AppHeader from "./AppHeader";
import { Mark } from "../ui/Logo";
import { Avatar, Sheet, EmptyState, Spinner } from "../ui/kit";

export { default as ProfileModal } from "./ProfileSheet";

// ─── Demo profiles (only when the school gate is off and nobody is real yet) ───
const DEMO_PROFILES = [
  { id: "d1", name: "Maya Chen", school: "UCLA", class_year: "Junior", major: "Computer Science", pct: 94, isMatch: true, is_verified_student: true,
    photo: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=900&q=80",
    bio: "cs major, hackathon goblin, oat milk latte loyalist. i keep a tidy space and live on lo-fi.",
    looking_for: "someone chill who respects quiet hours after 10pm. bonus points for hiking or indie films.",
    dorm_prefs: { sleep_schedule: "night_owl", cleanliness: "clean", study_habits: "in_room", noise: "quiet" } },
  { id: "d2", name: "Jordan Lee", school: "USC", class_year: "Sophomore", major: "Business", pct: 81, isMatch: false, is_verified_student: true,
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80",
    bio: "business by day, amateur chef by night. sunday meal prep is my personality. out the door by 7.",
    looking_for: "low drama and independent. i travel a lot for internships.",
    dorm_prefs: { sleep_schedule: "early_bird", cleanliness: "very_clean", social: "social", partying: "sometimes" } },
  { id: "d3", name: "Priya Nair", school: "NYU", class_year: "Senior", major: "Psychology", pct: 88, isMatch: true, is_verified_student: true,
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
    bio: "writing my thesis on decision making. candles, 6am yoga, a very calm home.",
    looking_for: "a grounded roommate who also needs a peaceful place to think.",
    dorm_prefs: { sleep_schedule: "early_bird", cleanliness: "very_clean", noise: "silent", social: "private" } },
  { id: "d4", name: "Marcus Webb", school: "Stanford", class_year: "Junior", major: "Mechanical Engineering", pct: 76, isMatch: false, is_verified_student: true,
    photo: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&q=80",
    bio: "rock climbing on weekends, robotics in between. movie nights are mandatory.",
    looking_for: "social, but finals week means total silence. down to split cooking.",
    dorm_prefs: { sleep_schedule: "night_owl", cleanliness: "relaxed", social: "very_social", guests: "occasionally" } },
  { id: "d5", name: "Sofia Reyes", school: "MIT", class_year: "Freshman", major: "Biology", pct: 91, isMatch: true, is_verified_student: true,
    photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=80",
    bio: "pre-med from miami. pilates, cuban food, and a clean space for a clear mind.",
    looking_for: "driven and kind, takes school seriously but still has fun on weekends.",
    dorm_prefs: { sleep_schedule: "early_bird", cleanliness: "clean", study_habits: "library", partying: "sometimes" } },
];

const COMPAT_KEYS = ["sleep_schedule", "cleanliness", "study_habits", "guests", "noise", "social", "partying", "smoking"];
function compatPercent(mine, theirs) {
  if (!mine || !theirs) return null;
  const answered = COMPAT_KEYS.filter((k) => mine[k] && theirs[k]);
  if (!answered.length) return null;
  return Math.round((answered.filter((k) => mine[k] === theirs[k]).length / answered.length) * 100);
}
function shortSchool(name) {
  if (!name) return null;
  const a = { "New York University (NYU)": "NYU", "Massachusetts Institute of Technology": "MIT" };
  return a[name] || name;
}
function toCard(c, viewerPrefs) {
  const parts = (c.name || "").split(" ");
  return {
    ...c,
    firstName: parts[0] || c.name,
    pct: c.pct ?? compatPercent(viewerPrefs, c.dorm_prefs || {}),
    sub: [c.class_year, c.major].filter(Boolean).join(", "),
    isMatch: !!c.isMatch,
  };
}

const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "fake", label: "Fake profile" },
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
];

function ReportSheet({ person, userId, onClose, onDone, demo }) {
  const [reason, setReason] = useState("inappropriate");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      if (!demo) await reportUser(userId, person.id, reason, notes);
      setDone(true);
      setTimeout(onDone, 1100);
    } catch { onClose(); } finally { setBusy(false); }
  };
  return (
    <Sheet open onClose={onClose} title={done ? "" : `Report ${person.firstName || person.name}`} labelledBy="r8-report-title">
      {done ? (
        <EmptyState icon="shield" title="Report sent" body="Thanks for keeping Room8 safe. We'll review this profile." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p className="r8-muted" style={{ fontSize: 15, marginBottom: 4 }}>What's going on? They won't know you reported them.</p>
          {REPORT_REASONS.map((r) => (
            <button key={r.value} onClick={() => setReason(r.value)} aria-pressed={reason === r.value}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 52, padding: "0 16px", borderRadius: 16, textAlign: "left", fontSize: 15, fontWeight: 500,
                background: reason === r.value ? "var(--iri-soft)" : "var(--glass)", border: `1.5px solid ${reason === r.value ? "rgba(140,158,255,.7)" : "var(--line)"}` }}>
              {r.label}
              {reason === r.value && <Icon name="check" size={18} stroke={2.4} />}
            </button>
          ))}
          <textarea className="r8-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else we should know? (optional)" style={{ minHeight: 84 }} />
          <button className="r8-btn r8-btn--danger r8-btn--block" onClick={submit} disabled={busy}>{busy ? "Sending..." : "Send report"}</button>
        </div>
      )}
    </Sheet>
  );
}

// ─── One card ─────────────────────────────────────────────────────
const Card = forwardRef(function Card({ person, depth, onSwiped, onOpen, onMenu }, ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-320, 0, 320], [-16, 0, 16]);
  const likeOpacity = useTransform(x, [24, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -24], [1, 0]);
  const likeScale = useTransform(x, [24, 140], [0.8, 1.05]);
  const passScale = useTransform(x, [-140, -24], [1.05, 0.8]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = photosOf(person);
  const flying = useRef(false);
  const cardEl = useRef(null);
  const isTop = depth === 0;

  const fly = useCallback((dir, velocity = 0) => {
    if (flying.current) return;
    flying.current = true;
    const w = typeof window !== "undefined" ? window.innerWidth : 800;
    const target = (dir === "right" ? 1 : -1) * (w + 260);
    animate(x, target, { type: "spring", stiffness: 160, damping: 26, velocity, restDelta: 40 });
    animate(y, y.get() - 40, { duration: 0.4 });
    setTimeout(() => onSwiped(dir), 230);
  }, [x, y, onSwiped]);

  useImperativeHandle(ref, () => ({ swipe: (dir) => { haptic("light"); fly(dir, dir === "right" ? 1400 : -1400); } }), [fly]);

  const onDragEnd = (_, info) => {
    const dx = info.offset.x, vx = info.velocity.x;
    if (dx > 110 || vx > 650) { haptic("light"); fly("right", vx); }
    else if (dx < -110 || vx < -650) { haptic("light"); fly("left", vx); }
    else {
      animate(x, 0, { type: "spring", stiffness: 520, damping: 30 });
      animate(y, 0, { type: "spring", stiffness: 520, damping: 30 });
    }
  };

  const onTap = (e, info) => {
    if (!isTop || !cardEl.current) return;
    const rect = cardEl.current.getBoundingClientRect();
    const rx = (info.point.x - rect.left) / rect.width;
    const ry = (info.point.y - rect.top) / rect.height;
    if (photos.length > 1 && ry < 0.66 && (rx < 0.32 || rx > 0.68)) {
      haptic("light");
      setPhotoIdx((i) => (rx < 0.5 ? Math.max(0, i - 1) : Math.min(photos.length - 1, i + 1)));
      return;
    }
    onOpen(person);
  };

  const traits = traitsFor(person.dorm_prefs || {}, 3);
  const src = photos[photoIdx];

  return (
    <motion.div
      style={{ position: "absolute", inset: 0, zIndex: 10 - depth, pointerEvents: isTop ? "auto" : "none" }}
      initial={false}
      animate={{ scale: 1 - depth * 0.04, y: depth * 10, opacity: depth > 2 ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
    <motion.div
      ref={cardEl}
      style={{ x, y, rotate, touchAction: "none", position: "absolute", inset: 0 }}
      drag={isTop}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      onTap={onTap}
      whileTap={isTop ? { scale: 0.985 } : undefined}
    >
      <div style={{ position: "absolute", inset: 0, borderRadius: 30, overflow: "hidden", background: "#2a2a2c", boxShadow: depth === 0 ? "0 24px 60px rgba(17,17,18,.22)" : "0 10px 30px rgba(17,17,18,.12)", cursor: isTop ? "grab" : "default", userSelect: "none", WebkitUserSelect: "none" }}>
        {src ? (
          <img key={src} src={src} alt={person.name} draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
        ) : <NoPhoto name={person.name} />}

        {photos.length > 1 && (
          <div style={{ position: "absolute", top: 14, left: 16, right: 16, display: "flex", gap: 5, zIndex: 3 }}>
            {photos.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i === photoIdx ? "#fff" : "rgba(255,255,255,.35)" }} />)}
          </div>
        )}

        {/* Like / pass stamps */}
        <motion.div aria-hidden="true" style={{ opacity: likeOpacity, scale: likeScale, rotate: -8, position: "absolute", top: 46, left: 22, zIndex: 4 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 46, padding: "0 20px", borderRadius: 999, background: "var(--iri)", color: "#111112", fontWeight: 700, fontSize: 20, boxShadow: "0 10px 30px rgba(157,177,255,.45)" }}><Icon name="heart" size={20} fill="#111112" color="#111112" />Like</span>
        </motion.div>
        <motion.div aria-hidden="true" style={{ opacity: passOpacity, scale: passScale, rotate: 8, position: "absolute", top: 46, right: 22, zIndex: 4 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 46, padding: "0 20px", borderRadius: 999, background: "#fff", color: "#111112", fontWeight: 700, fontSize: 20, boxShadow: "0 10px 30px rgba(0,0,0,.25)" }}><Icon name="x" size={20} stroke={2.6} />Pass</span>
        </motion.div>

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "120px 18px 18px", background: "linear-gradient(180deg, transparent, rgba(17,17,18,.5) 30%, rgba(17,17,18,.88) 70%, rgba(17,17,18,.94))", color: "#fff", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.04em", color: "#fff" }}>{person.firstName}{person.age ? `, ${person.age}` : ""}</h2>
                <PhotoVerifiedCheck verified={person.is_photo_verified} size={22} />
              </div>
              {(person.school || person.class_year) && (
                <p style={{ marginTop: 4, fontSize: 16, color: "rgba(255,255,255,.86)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {[person.school, person.class_year].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <MatchBadge pct={person.pct} size={68} />
          </div>
          {traits.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {traits.map((t) => <span key={t.key} className="r8-photo-tag">{t.label}</span>)}
            </div>
          )}
          {isTop && (
            <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 18 }}>
              <button className="r8-card-btn" aria-label="Pass" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); haptic("light"); fly("left", -1400); }}>
                <Icon name="x" size={26} stroke={2.2} />
              </button>
              <button className="r8-card-btn" aria-label={`Open ${person.firstName}'s full profile`} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onOpen(person); }}>
                <Icon name="arrowUp" size={24} stroke={2.2} />
              </button>
              <button className="r8-card-btn r8-card-btn--like" aria-label="Like" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); haptic("light"); fly("right", 1400); }}>
                <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><linearGradient id="r8-heart-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5FE3F4" /><stop offset=".5" stopColor="#9DB1FF" /><stop offset="1" stopColor="#F58AC4" /></linearGradient></svg>
                <Icon name="heart" size={28} stroke={0} fill="url(#r8-heart-g)" />
              </button>
            </div>
          )}
        </div>

        {isTop && (
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onMenu(person); }} aria-label="Report or block"
            style={{ position: "absolute", top: photos.length > 1 ? 30 : 16, left: 14, zIndex: 5, width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "rgba(14,15,18,.35)", WebkitBackdropFilter: "blur(12px)", backdropFilter: "blur(12px)" }}>
            <Icon name="more" size={20} />
          </button>
        )}
      </div>
    </motion.div>
    </motion.div>
  );
});

// ─── Deck ─────────────────────────────────────────────────────────
export default function SwipeDeck() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const viewerPrefs = user?.dorm_prefs || {};

  const [candidates, setCandidates] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [menuTarget, setMenuTarget] = useState(null);
  const [profile, setProfile] = useState(null);
  const [resendSent, setResendSent] = useState(false);
  const [gate, setGate] = useState(null);
  const topRef = useRef(null);

  const load = (reset = false) => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    getSchoolStatus()
      .catch(() => null)
      .then((status) => {
        setGate(status);
        if (status?.gate_enabled && !status.is_unlocked) { setCandidates([]); return; }
        return getCandidates(user.id, reset).then((d) => { setCandidates(Array.isArray(d) ? d : []); setIdx(0); });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(false); }, []); // eslint-disable-line

  const gateOn = !!gate?.gate_enabled;
  const locked = gateOn && !gate.is_unlocked;
  const usesDemo = candidates.length === 0 && !gateOn;
  const deck = (candidates.length ? candidates : (gateOn ? [] : DEMO_PROFILES)).map((c) => toCard(c, viewerPrefs));
  const current = deck[idx] || null;

  const onSwiped = useCallback(async (dir) => {
    const candidate = deck[idx];
    setIdx((p) => p + 1);
    if (!candidate) return;
    if (usesDemo) {
      if (dir === "right" && candidate.isMatch) setTimeout(() => setMatch(candidate), 260);
      return;
    }
    try {
      if (dir === "right") {
        const res = await likeUser(user.id, candidate.id);
        if (res?.matched) {
          setTimeout(() => setMatch(candidate), 260);
          sendNotification("New match on Room8", `You and ${candidate.firstName} liked each other.`);
        }
      } else {
        await skipUser(user.id, candidate.id);
      }
    } catch (err) { console.error(err); }
  }, [deck, idx, usesDemo, user]); // eslint-disable-line

  // Desktop arrow keys
  useEffect(() => {
    const h = (e) => {
      if (profile || match || reportTarget || menuTarget) return;
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") topRef.current?.swipe("right");
      if (e.key === "ArrowLeft") topRef.current?.swipe("left");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [profile, match, reportTarget, menuTarget]);

  const block = async (person) => {
    setMenuTarget(null);
    setIdx((p) => p + 1);
    if (!usesDemo) { try { await blockUser(user.id, person.id); } catch (e) { console.error(e); } }
  };

  const visible = deck.slice(idx, idx + 3);

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: "100dvh", background: "var(--bg)", overflow: "hidden" }}>
      <AppHeader />

      {user && user.email_verified === false && (
        <div className="r8-glass" style={{ position: "relative", zIndex: 20, margin: "0 16px 8px", borderRadius: 16, padding: "10px 12px 10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "rgba(255,200,96,.12)", borderColor: "rgba(255,200,96,.3)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500 }}><Icon name="mail" size={18} />Confirm your email to start matching</span>
          <button className="r8-btn r8-btn--glass r8-btn--sm" style={{ height: 34 }} onClick={async () => { try { await resendVerification(user.id); setResendSent(true); setTimeout(() => setResendSent(false), 4000); } catch (e) { console.error(e); } }}>
            {resendSent ? "Sent" : "Resend"}
          </button>
        </div>
      )}

      <main style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "4px 16px calc(64px + var(--safe-b) + 14px)" }}>
        {loading ? (
          <div style={{ width: "min(420px, 100%)", height: "min(620px, calc(100dvh - 300px))", borderRadius: 32 }} className="r8-skel" aria-label="Finding roommates" />
        ) : !user ? (
          <EmptyState icon="lock" title="Log in to start swiping" action={<button className="r8-btn r8-btn--primary" onClick={() => navigate("/login")}>Log in</button>} />
        ) : locked ? (
          <WaitlistScreen status={gate} user={user} onRefresh={() => load(false)} />
        ) : !current ? (
          <EmptyState icon="sparkle" title="You're all caught up" body="You've seen everyone at your school for now. New people join every day."
            action={<button className="r8-btn r8-btn--primary" onClick={() => load(true)}><Icon name="refresh" size={18} />See people again</button>} />
        ) : (
          <>
            <div style={{ position: "relative", width: "min(440px, 100%)", height: "min(720px, calc(100dvh - 236px - var(--safe-t) - var(--safe-b)))", minHeight: 440 }}>
              {visible.slice().reverse().map((p) => {
                const depth = visible.indexOf(p);
                return (
                  <Card
                    key={p.id}
                    ref={depth === 0 ? topRef : undefined}
                    person={p}
                    depth={depth}
                    onSwiped={onSwiped}
                    onOpen={setProfile}
                    onMenu={setMenuTarget}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      {profile && (
        <ProfileSheet
          person={profile}
          onClose={() => setProfile(null)}
          onMore={() => { setMenuTarget(profile); }}
          onPass={profile.id === current?.id ? () => { setProfile(null); setTimeout(() => topRef.current?.swipe("left"), 280); } : undefined}
          onLike={profile.id === current?.id ? () => { setProfile(null); setTimeout(() => topRef.current?.swipe("right"), 280); } : undefined}
        />
      )}

      <Sheet open={!!menuTarget} onClose={() => setMenuTarget(null)} title={menuTarget ? menuTarget.firstName || menuTarget.name : ""} labelledBy="r8-menu-title">
        {menuTarget && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="r8-btn r8-btn--glass r8-btn--block" style={{ justifyContent: "flex-start" }} onClick={() => { const t = menuTarget; setMenuTarget(null); setProfile(null); setReportTarget(t); }}><Icon name="flag" size={20} />Report</button>
            <button className="r8-btn r8-btn--glass r8-btn--block" style={{ justifyContent: "flex-start", color: "var(--danger)" }} onClick={() => { const t = menuTarget; setProfile(null); block(t); }}><Icon name="block" size={20} />Block</button>
            <p className="r8-faint" style={{ fontSize: 13, textAlign: "center", marginTop: 4 }}>Blocking hides you from each other. They won't be notified.</p>
          </div>
        )}
      </Sheet>

      {reportTarget && (
        <ReportSheet person={reportTarget} userId={user?.id} demo={usesDemo} onClose={() => setReportTarget(null)}
          onDone={() => { setReportTarget(null); setIdx((p) => p + 1); }} />
      )}

      <AnimatePresence>
        {match && (
          <MatchMoment
            me={user}
            them={match}
            onClose={() => setMatch(null)}
            onChat={() => { const m = match; setMatch(null); if (!usesDemo) navigate("/messages", { state: { openUserId: m.id } }); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
