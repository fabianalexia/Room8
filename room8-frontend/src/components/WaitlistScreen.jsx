// Shown instead of the swipe deck while the user's school is still locked.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Icon from "../ui/Icon";

const INVITE_URL = "https://swiperoom8.com/register";

export default function WaitlistScreen({ status, user, onRefresh }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!status?.school) {
    return (
      <Shell>
        <Badge icon="school" text="One step left" />
        <h2 style={h2}>Pick your school</h2>
        <p style={p}>Room8 only shows you students from your own campus. Choose your school to join its waitlist.</p>
        <button className="r8-btn r8-btn--primary r8-btn--block" onClick={() => navigate("/onboarding/school")}>Choose school</button>
      </Shell>
    );
  }

  const { name, verified_count, unlock_threshold, remaining } = status.school;
  const pct = Math.min(100, Math.round((verified_count / Math.max(1, unlock_threshold)) * 100));

  const share = async () => {
    const text = `I'm on the Room8 waitlist for ${name}. We need ${remaining} more students to unlock roommate matching. Join with your school email:`;
    try {
      if (navigator.share) { await navigator.share({ title: "Join me on Room8", text, url: INVITE_URL }); return; }
    } catch { return; }
    try {
      await navigator.clipboard.writeText(`${text} ${INVITE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard blocked */ }
  };

  return (
    <Shell>
      <Badge icon="clock" text="Waitlist" />
      <h2 style={h2}>{name} opens at {unlock_threshold} students</h2>
      <p style={p}>We open each campus once enough students join, so your first swipe has real people behind it.</p>

      <div style={{ width: "100%", margin: "6px 0 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13, color: "var(--text-2)", marginBottom: 10 }}>
          <span><b style={{ color: "var(--text)", fontSize: 26, fontFamily: "var(--display)", letterSpacing: "-0.03em" }}>{verified_count}</b> of {unlock_threshold} joined</span>
          <span className="r8-badge r8-badge--iri">{remaining} to go</span>
        </div>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={unlock_threshold} aria-valuenow={verified_count}
          style={{ height: 12, borderRadius: 999, background: "var(--glass-2)", overflow: "hidden", border: "1px solid var(--line)" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 90, damping: 20 }}
            style={{ height: "100%", borderRadius: 999, background: "var(--iri)" }} />
        </div>
      </div>

      {!status.you_count && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: 18, background: "rgba(255,200,96,.10)", border: "1px solid rgba(255,200,96,.28)" }}>
          <p style={{ ...p, color: "var(--text)" }}>You're not counted yet. Verify your school email to help unlock {name}.</p>
          <button className="r8-btn r8-btn--glass r8-btn--sm" onClick={() => navigate("/verify/student")}><Icon name="mail" size={18} />Verify school email</button>
        </div>
      )}

      <button className="r8-btn r8-btn--primary r8-btn--block" onClick={share}>
        <Icon name={copied ? "check" : "users"} size={20} />{copied ? "Link copied" : "Invite classmates"}
      </button>
      {!user?.is_photo_verified && (
        <button className="r8-btn r8-btn--glass r8-btn--block" onClick={() => navigate("/verify/photo")}>
          <Icon name="verified" size={20} />Get photo verified while you wait
        </button>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <button className="r8-btn r8-btn--ghost r8-btn--sm" onClick={() => navigate("/profile")}>Finish profile</button>
        <button className="r8-btn r8-btn--ghost r8-btn--sm" onClick={onRefresh}><Icon name="refresh" size={16} />Refresh</button>
      </div>
      <p style={{ ...p, fontSize: 12.5 }}>You'll get a notification the moment {name} goes live.</p>
    </Shell>
  );
}

function Badge({ icon, text }) {
  return <span className="r8-sticker r8-sticker--pill"><Icon name={icon} size={14} stroke={2.2} />{text}</span>;
}

function Shell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="r8-card"
      style={{ width: "min(420px, calc(100vw - 32px))", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", padding: "28px 22px 22px" }}
    >
      {children}
    </motion.div>
  );
}

const h2 = { fontSize: 26, lineHeight: 1.15 };
const p = { color: "var(--text-2)", fontSize: 15, lineHeight: 1.55 };
