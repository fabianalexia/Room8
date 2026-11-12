// Full scrollable profile (Hinge style). Opens from the swipe card, likes, and chats.
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Icon, { traitsFor } from "../ui/Icon";
import VerifiedBadge, { PhotoVerifiedCheck } from "./VerifiedBadge";
import { initials } from "../ui/kit";
import MatchBadge from "../ui/MatchBadge";

const CATEGORY = { sleep_schedule: "Sleep", cleanliness: "Clean", study_habits: "Studying", noise: "Noise", social: "Social", guests: "Guests", partying: "Parties", smoking: "Smoking" };

export function photosOf(person) {
  return [person?.profilePhoto || person?.photo, ...(person?.photos || [])].filter((p, i, a) => p && a.indexOf(p) === i);
}

export default function ProfileSheet({ person, onClose, onLike, onPass, onMore, compat }) {
  const [photo, setPhoto] = useState(0);
  const photos = photosOf(person);
  const traits = traitsFor(person?.dorm_prefs || {}, 8);
  const basics = [["book", "Major", person?.major], ["calendar", "Year", person?.class_year], ["school", "School", person?.school]].filter((r) => r[2]);
  const pct = compat ?? person?.pct;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", h); };
  }, [onClose]);

  if (!person) return null;
  const sub = [person.class_year, person.major].filter(Boolean).join(", ");
  const extra = photos.slice(1);

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="sheet"
        role="dialog" aria-modal="true" aria-label={`${person.name}'s profile`}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        className="r8-noscroll"
        style={{ position: "fixed", inset: 0, zIndex: 950, background: "var(--elev)", overflowY: "auto", WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto", paddingBottom: onLike ? 140 : 48 }}>
          {/* Hero photo */}
          <div style={{ position: "relative", height: "min(54dvh, 560px)", minHeight: 360, overflow: "hidden", background: "var(--elev)" }}>
            {photos.length ? (
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                  key={photos[photo]}
                  src={photos[photo]} alt={person.name}
                  initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              </AnimatePresence>
            ) : (
              <NoPhoto name={person.name} />
            )}
            {photos.length > 1 && (
              <>
                <button aria-label="Previous photo" onClick={() => setPhoto((p) => Math.max(0, p - 1))} style={{ position: "absolute", left: 0, top: 70, bottom: 120, width: "40%" }} />
                <button aria-label="Next photo" onClick={() => setPhoto((p) => Math.min(photos.length - 1, p + 1))} style={{ position: "absolute", right: 0, top: 70, bottom: 120, width: "40%" }} />
                <div style={{ position: "absolute", top: "calc(var(--safe-t) + 12px)", left: 76, right: 76, display: "flex", gap: 5 }}>
                  {photos.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i === photo ? "#fff" : "rgba(255,255,255,.35)", transition: "background .2s" }} />)}
                </div>
              </>
            )}
            <div style={{ position: "absolute", inset: "auto 0 0 0", height: "55%", background: "linear-gradient(180deg, transparent, rgba(17,17,18,.75))", pointerEvents: "none" }} />

            <div style={{ position: "absolute", top: "calc(var(--safe-t) + 8px)", left: 14, right: 14, display: "flex", justifyContent: "space-between" }}>
              <button className="r8-icon-btn r8-icon-btn--round" onClick={onClose} aria-label="Close profile" style={{ color: "#fff", background: "rgba(14,15,18,.4)", borderColor: "rgba(255,255,255,.2)" }}>
                <Icon name="back" size={22} />
              </button>
              {onMore && (
                <button className="r8-icon-btn r8-icon-btn--round" onClick={onMore} aria-label="More options" style={{ color: "#fff", background: "rgba(14,15,18,.4)", borderColor: "rgba(255,255,255,.2)" }}>
                  <Icon name="more" size={22} />
                </button>
              )}
            </div>

            <div style={{ position: "absolute", left: 20, right: 20, bottom: 44, color: "#fff", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h1 style={{ fontSize: "clamp(32px, 9vw, 40px)", fontWeight: 700, letterSpacing: "-0.04em", color: "#fff" }}>{person.firstName || person.name}{person.age ? `, ${person.age}` : ""}</h1>
                  <PhotoVerifiedCheck verified={person.is_photo_verified} size={24} />
                </div>
                {person.school && <p style={{ marginTop: 4, fontSize: 16, opacity: .88 }}>{person.school}</p>}
              </div>
              <MatchBadge pct={pct} size={68} />
            </div>
          </div>

          <div style={{ position: "relative", marginTop: -26, background: "var(--elev)", borderRadius: "28px 28px 0 0", padding: "26px 22px 8px", display: "flex", flexDirection: "column", gap: 28, minHeight: 300 }}>
            {(person.is_verified_student || person.is_photo_verified) && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <VerifiedBadge isStudent={person.is_verified_student} size="md" />
                {person.is_photo_verified && <span className="r8-badge"><Icon name="verified" size={14} />Photo verified</span>}
              </div>
            )}

            {person.bio && (
              <Section label="About me">
                <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--text-2)" }}>{person.bio}</p>
              </Section>
            )}

            {traits.length > 0 && (
              <Section label="Lifestyle">
                <Rows rows={traits.map((t) => [t.icon, CATEGORY[t.key], t.label])} />
              </Section>
            )}

            {basics.length > 0 && (
              <Section label="The basics">
                <Rows rows={basics} />
              </Section>
            )}

            {person.looking_for && (
              <Section label="Looking for">
                <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--text-2)" }}>{person.looking_for}</p>
              </Section>
            )}

            {extra.map((src, i) => <Photo key={src} src={src} alt={`${person.name}, photo ${i + 2}`} />)}
          </div>
        </div>

        {(onLike || onPass) && (
          <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: "22px 20px calc(var(--safe-b) + 18px)", background: "linear-gradient(180deg, transparent, var(--elev) 40%)" }}>
            <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", gap: 12 }}>
              {onPass && <button className="r8-btn r8-btn--soft r8-btn--lg" onClick={onPass} aria-label="Pass" style={{ width: 58, padding: 0 }}><Icon name="x" size={24} stroke={2.2} /></button>}
              {onLike && <button className="r8-btn r8-btn--primary r8-btn--lg" onClick={onLike} style={{ flex: 1 }}>Request to Match</button>}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function Section({ label, children }) {
  return (
    <section>
      <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10 }}>{label}</h2>
      {children}
    </section>
  );
}

function Rows({ rows }) {
  return (
    <div>
      {rows.map(([icon, label, value], i) => (
        <div key={label + i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
          <Icon name={icon} size={19} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>{label}</span>
          <span style={{ marginLeft: "auto", fontSize: 15, color: "var(--text-2)", textAlign: "right" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function Photo({ src, alt }) {
  return <img src={src} alt={alt} loading="lazy" style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", borderRadius: 22 }} />;
}

export function NoPhoto({ name, size = 120 }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--elev)", overflow: "hidden" }}>
      <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 300, height: 300, top: "10%", left: "-20%" }} />
      <div aria-hidden="true" className="r8-aura r8-aura--b" style={{ width: 260, height: 260, bottom: "5%", right: "-25%" }} />
      <span style={{ position: "relative", width: size, height: size, borderRadius: "50%", background: "var(--glass-2)", border: "1px solid var(--line-2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 700, fontSize: size * 0.34, color: "var(--text)" }}>
        {initials(name)}
      </span>
    </div>
  );
}

export function RoundAction({ kind, onClick, size }) {
  const like = kind === "like";
  const s = size || (like ? 72 : 60);
  return (
    <motion.button
      onClick={onClick} aria-label={like ? "Like" : "Pass"}
      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      style={{
        pointerEvents: "auto", width: s, height: s, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        ...(like
          ? { background: "var(--iri)", color: "#111112", boxShadow: "var(--glow), inset 0 1px 0 rgba(255,255,255,.5)" }
          : { background: "var(--elev-2)", color: "var(--text)" }),
      }}
    >
      <Icon name={like ? "heart" : "x"} size={like ? 32 : 26} stroke={like ? 2.2 : 2.4} fill={like ? "#0E0F12" : "none"} color={like ? "#0E0F12" : "currentColor"} />
    </motion.button>
  );
}
