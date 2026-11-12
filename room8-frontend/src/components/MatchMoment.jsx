// Full-screen "It's a Match" moment, shared by Discover and Likes
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { haptic } from "../native";
import { NoPhoto } from "./ProfileSheet";
import MatchBadge from "../ui/MatchBadge";

const spring = { type: "spring", stiffness: 260, damping: 22 };

export default function MatchMoment({ me, them, onChat, onClose }) {
  useEffect(() => { haptic("match"); }, []);
  const pct = them?.pct;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      role="dialog" aria-modal="true" aria-label="It's a match"
      style={{ position: "fixed", inset: 0, zIndex: 980, background: "#141416", display: "flex", flexDirection: "column", alignItems: "center", padding: "calc(var(--safe-t) + 72px) 28px calc(var(--safe-b) + 28px)", textAlign: "center", overflow: "hidden", color: "#fff" }}
    >
      <motion.div aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
        style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 40% at 15% 70%, rgba(95,227,244,.22), transparent 70%), radial-gradient(55% 40% at 90% 55%, rgba(219,140,242,.30), transparent 70%), radial-gradient(50% 35% at 50% 100%, rgba(245,138,196,.18), transparent 70%)" }} />

      <motion.h1 initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring, delay: 0.1 }}
        style={{ position: "relative", fontSize: "clamp(52px, 15vw, 76px)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 0.95, color: "#fff" }}>
        It's a<br />Match
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ position: "relative", color: "rgba(255,255,255,.78)", fontSize: 17, lineHeight: 1.45, marginTop: 18, maxWidth: 280 }}>
        {pct != null ? `You and ${them.firstName} are a ${pct}% match for roommates.` : `You and ${them.firstName} both want to live together.`}
      </motion.p>

      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 240 }}>
        <div style={{ position: "relative", display: "flex" }}>
          <motion.div initial={{ x: -140, rotate: -18, opacity: 0 }} animate={{ x: 12, rotate: -8, opacity: 1 }} transition={{ ...spring, delay: 0.2 }}>
            <Polaroid person={them} />
          </motion.div>
          <motion.div initial={{ x: 140, rotate: 18, opacity: 0 }} animate={{ x: -12, rotate: 7, opacity: 1 }} transition={{ ...spring, delay: 0.28 }} style={{ marginTop: -14 }}>
            <Polaroid person={me} />
          </motion.div>
          {pct != null && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 480, damping: 15, delay: 0.55 }}
              style={{ position: "absolute", left: "50%", bottom: -30, marginLeft: -44, borderRadius: "50%", border: "4px solid #141416" }}>
              <MatchBadge pct={pct} size={84} />
            </motion.div>
          )}
        </div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring, delay: 0.6 }}
        style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%", maxWidth: 340, marginTop: 40 }}>
        <button className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" onClick={onChat}>Send a Message</button>
        <button onClick={onClose} style={{ color: "rgba(255,255,255,.8)", fontSize: 15, fontWeight: 500, padding: 8 }}>Keep Matching</button>
      </motion.div>
    </motion.div>
  );
}

function Polaroid({ person }) {
  const src = person?.profilePhoto || person?.photo;
  return (
    <div style={{ width: "min(150px, 38vw)", padding: 7, background: "#fff", borderRadius: 18, boxShadow: "0 24px 50px rgba(0,0,0,.45)" }}>
      <div style={{ aspectRatio: "4 / 5", borderRadius: 12, overflow: "hidden", position: "relative", background: "#2a2a2c" }}>
        {src ? <img src={src} alt={person?.name || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <NoPhoto name={person?.name} size={56} />}
      </div>
    </div>
  );
}
