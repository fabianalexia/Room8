// Full-screen "it's a match" moment, shared by Discover and Likes
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { haptic } from "../native";
import Icon from "../ui/Icon";
import { NoPhoto } from "./ProfileSheet";

// ─── Match moment ─────────────────────────────────────────────────
export default function MatchMoment({ me, them, onChat, onClose }) {
  useEffect(() => { haptic("match"); }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 980, background: "rgba(8,9,12,.82)", WebkitBackdropFilter: "blur(22px) saturate(160%)", backdropFilter: "blur(22px) saturate(160%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center", overflow: "hidden" }}
    >
      <motion.div aria-hidden="true" initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 0.75 }} transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", background: "conic-gradient(from 0deg, #45D9FF, #8C9EFF, #D98BFF, #FF5FA0, #45D9FF)", filter: "blur(90px)" }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: 34 }}>
        <motion.div initial={{ x: -120, rotate: -20, opacity: 0 }} animate={{ x: 14, rotate: -8, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}>
          <MatchPhoto person={me} />
        </motion.div>
        <motion.div initial={{ x: 120, rotate: 20, opacity: 0 }} animate={{ x: -14, rotate: 8, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.18 }}>
          <MatchPhoto person={them} />
        </motion.div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.45 }}
          style={{ position: "absolute", left: "50%", bottom: -18, marginLeft: -28, width: 56, height: 56, borderRadius: "50%", background: "var(--iri)", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(0,0,0,.4)" }}>
          <Icon name="heart" size={26} fill="#0E0F12" color="#0E0F12" />
        </motion.div>
      </div>
      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 24 }}
        style={{ position: "relative", fontSize: "clamp(40px, 12vw, 64px)", color: "#fff", lineHeight: 1 }}>
        it's a <span className="r8-iri-text">match</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ position: "relative", color: "rgba(255,255,255,.72)", fontSize: 16, margin: "12px 0 30px", maxWidth: 300 }}>
        You and {them.firstName} both want to live together. Say hi before someone else does.
      </motion.p>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 24 }}
        style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 320 }}>
        <button className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" onClick={onChat}><Icon name="send" size={20} />Send a message</button>
        <button className="r8-btn r8-btn--block" onClick={onClose} style={{ color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.06)" }}>Keep swiping</button>
      </motion.div>
    </motion.div>
  );
}
function MatchPhoto({ person }) {
  const src = person?.profilePhoto || person?.photo;
  return (
    <div style={{ width: 128, height: 168, borderRadius: 26, overflow: "hidden", border: "3px solid #fff", background: "var(--elev)", boxShadow: "0 24px 50px rgba(0,0,0,.45)", position: "relative" }}>
      {src ? <img src={src} alt={person?.name || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <NoPhoto name={person?.name} size={64} />}
    </div>
  );
}

