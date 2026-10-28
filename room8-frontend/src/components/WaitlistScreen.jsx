// Shown instead of the swipe deck while the user's school is still locked.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const GOLD = "#f5a623";
const GOLD2 = "#f5c842";
const DARK = "#03040b";
const WHITE = "#ffffff";
const MUTED = "rgba(255,255,255,0.55)";
const JAKARTA = "'Plus Jakarta Sans', 'Inter', sans-serif";
const BEBAS = "'Bebas Neue', cursive";

const INVITE_URL = "https://swiperoom8.com/register";

export default function WaitlistScreen({ status, user, onRefresh }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // No school picked yet: send them to choose one
  if (!status?.school) {
    return (
      <Shell>
        <h2 style={h2}>Pick your school</h2>
        <p style={p}>Room8 only shows you students from your own campus. Choose your school to join its waitlist.</p>
        <button style={primaryBtn} onClick={() => navigate("/onboarding/school")}>Choose school</button>
      </Shell>
    );
  }

  const { name, verified_count, unlock_threshold, remaining } = status.school;
  const pct = Math.min(100, Math.round((verified_count / Math.max(1, unlock_threshold)) * 100));

  const share = async () => {
    const text = `I'm on the Room8 waitlist for ${name}. We need ${remaining} more students to unlock roommate matching. Join with your school email:`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join me on Room8", text, url: INVITE_URL });
        return;
      }
    } catch { /* user cancelled share sheet */ return; }
    try {
      await navigator.clipboard.writeText(`${text} ${INVITE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard blocked */ }
  };

  return (
    <Shell>
      <span style={{ fontFamily: BEBAS, letterSpacing: "0.12em", color: GOLD, fontSize: "0.95rem" }}>WAITLIST</span>
      <h2 style={h2}>{name} unlocks at {unlock_threshold} students</h2>
      <p style={p}>
        We open each campus once enough students join, so the first time you swipe there are real people to match with.
      </p>

      <div style={{ width: "100%", margin: "8px 0 6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: JAKARTA, fontSize: 13, color: MUTED, marginBottom: 8 }}>
          <span><b style={{ color: WHITE, fontSize: 20 }}>{verified_count}</b> of {unlock_threshold} joined</span>
          <span>{remaining} to go</span>
        </div>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={unlock_threshold} aria-valuenow={verified_count}
          style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg,${GOLD},${GOLD2})`, transition: "width .6s ease" }} />
        </div>
      </div>

      {!status.you_count && (
        <p style={{ ...p, color: "#fcd34d", fontSize: 13 }}>
          {user?.is_verified_student
            ? "Verify your email to count toward unlocking your school."
            : "Only students with a school email count toward unlocking. Sign up with your .edu email to be counted."}
        </p>
      )}

      <button style={primaryBtn} onClick={share}>{copied ? "Link copied" : "Invite classmates"}</button>

      {!user?.is_photo_verified && (
        <button style={secondaryBtn} onClick={() => navigate("/verify/photo")}>Get photo verified while you wait</button>
      )}
      <button style={linkBtn} onClick={() => navigate("/profile")}>Finish your profile</button>
      <button style={linkBtn} onClick={onRefresh}>Refresh count</button>
      <p style={{ ...p, fontSize: 12, marginTop: 4 }}>We'll send you a notification the moment {name} goes live.</p>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div style={{
      width: "min(420px, calc(100vw - 40px))", display: "flex", flexDirection: "column", alignItems: "center",
      gap: 12, textAlign: "center", padding: "28px 22px", borderRadius: 28,
      background: "linear-gradient(160deg,#0d1e3e,#08142a 45%,#050c1a)", border: "1px solid rgba(255,255,255,.08)",
      boxShadow: "0 20px 60px rgba(0,0,0,.45)",
    }}>
      {children}
    </div>
  );
}

const h2 = { margin: 0, color: WHITE, fontFamily: JAKARTA, fontSize: "1.45rem", fontWeight: 800, lineHeight: 1.25 };
const p = { margin: 0, color: MUTED, fontFamily: JAKARTA, fontSize: 14, lineHeight: 1.55 };
const primaryBtn = {
  width: "100%", marginTop: 8, background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: DARK, border: "none",
  padding: "14px 20px", borderRadius: 12, fontWeight: 800, fontSize: "1rem", cursor: "pointer", fontFamily: JAKARTA,
  boxShadow: "0 6px 24px rgba(245,166,35,.35)",
};
const secondaryBtn = {
  width: "100%", background: "rgba(29,155,240,.12)", color: "#7cc4f7", border: "1px solid rgba(29,155,240,.4)",
  padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: "0.92rem", cursor: "pointer", fontFamily: JAKARTA,
};
const linkBtn = { background: "none", border: "none", color: MUTED, fontFamily: JAKARTA, fontSize: 13, cursor: "pointer", textDecoration: "underline" };
