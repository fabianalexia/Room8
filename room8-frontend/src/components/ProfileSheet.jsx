// Full scrollable profile (Hinge style). Opens from the swipe card, likes, and chats.
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Icon, { traitsFor } from "../ui/Icon";
import VerifiedBadge, { PhotoVerifiedCheck } from "./VerifiedBadge";
import { initials } from "../ui/kit";

export function photosOf(person) {
  return [person?.profilePhoto || person?.photo, ...(person?.photos || [])].filter((p, i, a) => p && a.indexOf(p) === i);
}

export default function ProfileSheet({ person, onClose, onLike, onPass, onMore, compat }) {
  const [photo, setPhoto] = useState(0);
  const photos = photosOf(person);
  const traits = traitsFor(person?.dorm_prefs || {}, 8);
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
        style={{ position: "fixed", inset: 0, zIndex: 950, background: "var(--bg)", overflowY: "auto", WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto", paddingBottom: onLike ? 140 : 48 }}>
          {/* Hero photo */}
          <div style={{ position: "relative", height: "min(68dvh, 640px)", minHeight: 380, overflow: "hidden", background: "var(--elev)" }}>
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
            <div style={{ position: "absolute", inset: "auto 0 0 0", height: "55%", background: "linear-gradient(180deg, transparent, rgba(14,15,18,.86))", pointerEvents: "none" }} />

            <div style={{ position: "absolute", top: "calc(var(--safe-t) + 8px)", left: 14, right: 14, display: "flex", justifyContent: "space-between" }}>
              <button className="r8-icon-btn r8-icon-btn--round" onClick={onClose} aria-label="Close profile" style={{ color: "#fff", background: "rgba(14,15,18,.4)", borderColor: "rgba(255,255,255,.2)" }}>
                <Icon name="chevronDown" size={22} />
              </button>
              {onMore && (
                <button className="r8-icon-btn r8-icon-btn--round" onClick={onMore} aria-label="More options" style={{ color: "#fff", background: "rgba(14,15,18,.4)", borderColor: "rgba(255,255,255,.2)" }}>
                  <Icon name="more" size={22} />
                </button>
              )}
            </div>

            {pct != null && (
              <div className="r8-sticker" style={{ position: "absolute", right: 18, bottom: 110 }}>
                <b>{pct}%</b><small>MATCH</small>
              </div>
            )}

            <div style={{ position: "absolute", left: 20, right: 20, bottom: 22, color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontSize: "clamp(32px, 9vw, 42px)", color: "#fff" }}>{person.firstName || person.name}{person.age ? <span style={{ fontWeight: 500, opacity: .8 }}>, {person.age}</span> : null}</h1>
                <PhotoVerifiedCheck verified={person.is_photo_verified} size={24} />
              </div>
              {person.school && (
                <p style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 15, opacity: .85 }}>
                  <Icon name="school" size={17} />{person.school}{sub ? `, ${sub}` : ""}
                </p>
              )}
            </div>
          </div>

          <div style={{ padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <VerifiedBadge isStudent={person.is_verified_student} size="md" />
              {person.is_photo_verified && <span className="r8-badge"><Icon name="verified" size={14} />Photo verified</span>}
            </div>

            {person.bio && (
              <Section label="About me">
                <p style={{ fontSize: 20, lineHeight: 1.45, fontFamily: "var(--display)", fontWeight: 500, letterSpacing: "-0.015em" }}>{person.bio}</p>
              </Section>
            )}

            {extra[0] && <Photo src={extra[0]} alt={`${person.name}, photo 2`} />}

            {traits.length > 0 && (
              <Section label="How they live">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  {traits.map((t) => (
                    <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px", borderRadius: 16, background: "var(--glass)", border: "1px solid var(--line)" }}>
                      <span style={{ width: 34, height: 34, borderRadius: 11, background: "var(--iri-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={t.icon} size={18} /></span>
                      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.25 }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {person.looking_for && (
              <Section label="Looking for">
                <p style={{ fontSize: 20, lineHeight: 1.45, fontFamily: "var(--display)", fontWeight: 500, letterSpacing: "-0.015em" }}>{person.looking_for}</p>
              </Section>
            )}

            {extra.slice(1).map((src, i) => <Photo key={src} src={src} alt={`${person.name}, photo ${i + 3}`} />)}
          </div>
        </div>

        {(onLike || onPass) && (
          <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: "18px 20px calc(var(--safe-b) + 20px)", display: "flex", justifyContent: "center", gap: 18, background: "linear-gradient(180deg, transparent, var(--bg) 45%)", pointerEvents: "none" }}>
            {onPass && <RoundAction kind="pass" onClick={onPass} />}
            {onLike && <RoundAction kind="like" onClick={onLike} />}
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function Section({ label, children }) {
  return (
    <section className="r8-card" style={{ padding: "20px 20px 22px", borderRadius: 24 }}>
      <p className="r8-eyebrow" style={{ marginBottom: 10 }}>{label}</p>
      {children}
    </section>
  );
}

function Photo({ src, alt }) {
  return <img src={src} alt={alt} loading="lazy" style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", borderRadius: 24, border: "1px solid var(--line)" }} />;
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
          ? { background: "var(--iri)", color: "#0E0F12", boxShadow: "0 16px 40px rgba(217,139,255,.45), inset 0 2px 0 rgba(255,255,255,.45)" }
          : { background: "var(--glass-strong)", color: "var(--text)", border: "1px solid var(--line-2)", boxShadow: "var(--shadow-1)", WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)" }),
      }}
    >
      <Icon name={like ? "heart" : "x"} size={like ? 32 : 26} stroke={like ? 2.2 : 2.4} fill={like ? "#0E0F12" : "none"} color={like ? "#0E0F12" : "currentColor"} />
    </motion.button>
  );
}
