// src/Purpose.jsx: why Room8 exists
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Icon from "./ui/Icon";
import { Mark } from "./ui/Logo";

const reveal = { initial: { opacity: 0.35, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { type: "spring", stiffness: 160, damping: 24 } };

const VALUES = [
  { icon: "sliders", title: "Compatibility first", body: "We match on how you actually live, not just who looks cool in a photo." },
  { icon: "eye", title: "No mystery math", body: "You see why you match: the habits you share and the ones you don't." },
  { icon: "shield", title: "Safety and trust", body: "School email verification, photo checks reviewed by a person, and report and block everywhere." },
];

export default function Purpose() {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <section style={{ position: "relative", minHeight: "88dvh", display: "flex", alignItems: "center", padding: "calc(var(--safe-t) + 120px) 20px 80px" }}>
        <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 620, height: 620, top: -220, right: -200 }} />
        <div style={{ position: "relative", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
          <p className="r8-eyebrow" style={{ marginBottom: 18 }}>Our purpose</p>
          <h1 style={{ fontSize: "clamp(44px, 9vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.05em" }}>
            Roommate matching is still <span className="r8-iri-text">random,</span> <span className="r8-iri-text">rushed,</span> and <span className="r8-iri-text">mismatched.</span>
          </h1>
          <p className="r8-muted" style={{ fontSize: 20, maxWidth: 620, marginTop: 28, lineHeight: 1.5 }}>A housing form, a Facebook group, or straight up going random. Then you find out about the 3am alarms after you've signed the lease.</p>
        </div>
      </section>

      <section style={{ padding: "60px 20px 100px" }}>
        <motion.div {...reveal} className="r8-card" style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(28px, 6vw, 56px)", borderRadius: 40 }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.05 }}>We're changing that.</h2>
          <p className="r8-muted" style={{ fontSize: 19, lineHeight: 1.6, marginTop: 18, maxWidth: 700 }}>
            Room8 matches verified students from the same campus on the things that actually decide whether living together works: sleep schedules, cleanliness, study habits, noise and guests. You meet, you talk, and you decide before move-in day.
          </p>
        </motion.div>
      </section>

      <section style={{ padding: "0 20px 100px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.h2 {...reveal} style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 32, textAlign: "center" }}>What we care about</motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {VALUES.map((v, i) => (
              <motion.div key={v.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="r8-card" style={{ padding: 28, borderRadius: 30 }}>
                <span style={{ width: 52, height: 52, borderRadius: 17, background: "var(--iri)", color: "#0E0F12", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}><Icon name={v.icon} size={24} stroke={2} /></span>
                <h3 style={{ fontSize: 22, marginBottom: 8 }}>{v.title}</h3>
                <p className="r8-muted" style={{ fontSize: 16, lineHeight: 1.55 }}>{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "40px 20px 140px", textAlign: "center" }}>
        <motion.div {...reveal} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Mark size={64} />
          <h2 style={{ fontSize: "clamp(36px, 6vw, 60px)", marginTop: 22 }}>Ready to find your people?</h2>
          <p className="r8-muted" style={{ fontSize: 18, marginTop: 14 }}>Free early access for students. Takes about two minutes.</p>
          <Link to="/register" className="r8-btn r8-btn--primary r8-btn--lg" style={{ marginTop: 28 }}>Get started free<Icon name="arrowRight" size={20} /></Link>
        </motion.div>
      </section>
    </div>
  );
}
