// src/Home.jsx: Room8 public homepage
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { getCurrentUser, API_URL } from "./api";
import { FOUNDERS, TESTIMONIALS, TESTIMONIALS_MIN_TO_SHOW, COUNTER_MIN_TO_SHOW } from "./siteContent";
import Icon from "./ui/Icon";
import { Mark } from "./ui/Logo";
import { Avatar } from "./ui/kit";

const STEPS = [
  { icon: "user", title: "Build your profile", body: "Photos, a bio, and a few quick questions about how you actually live. Takes about five minutes." },
  { icon: "flame", title: "Swipe your campus", body: "Only verified students from your school. Your strongest compatibility matches show up first." },
  { icon: "chat", title: "Match and move in", body: "Both swipe right and the chat opens. Confirm each other as roommates when it's official." },
];

const FAQS = [
  { id: "faq-verification", q: "How does school verification work?",
    a: "Use your school .edu email and we send a quick confirmation to prove it's yours. That marks you as a verified student. Want the photo check too? Take a selfie in the pose we ask for and a real person on our team reviews it. No student ID uploads, no paperwork." },
  { id: "faq-data", q: "Do you sell my data?",
    a: "No. We never sell your data and we don't share it with advertisers or data brokers. Your answers about how you live are only used to match you with roommates. Your housing office only hears from us if you use Confirm Roommate.", link: { label: "Read the privacy policy", to: "/privacy" } },
  { id: "faq-free", q: "Is Room8 free?", a: "Yes. Room8 is free for students." },
  { id: "faq-app", q: "Is there an app?", a: "Room8 works in your phone or laptop browser right now at swiperoom8.com. A native iPhone app is in progress." },
  { id: "faq-random", q: "Why not just go random?",
    a: "Going random means hoping your roommate's sleep schedule, study habits, cleanliness and noise tolerance line up with yours. Room8 asks about those up front and shows your best matches first, so you can talk before move-in day." },
];

const reveal = { initial: { opacity: 0.35, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { type: "spring", stiffness: 160, damping: 24 } };

const DEMO = [
  { name: "Maya", age: 19, school: "Junior, CS", pct: 94, tags: [["moon", "Night owl"], ["sparkle", "Neat"]], a: "#45D9FF", b: "#8C9EFF" },
  { name: "Jordan", age: 20, school: "Sophomore, Business", pct: 88, tags: [["sun", "Early bird"], ["coffee", "Private"]], a: "#D98BFF", b: "#FF5FA0" },
  { name: "Priya", age: 21, school: "Senior, Psychology", pct: 91, tags: [["quiet", "Likes it quiet"], ["book", "Library"]], a: "#8C9EFF", b: "#45D9FF" },
];

function HeroPhone() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => n + 1), 2600);
    return () => clearInterval(t);
  }, []);
  const dir = i % 3 === 1 ? -1 : 1;
  const card = (k) => DEMO[k % DEMO.length];
  return (
    <div style={{ position: "relative", width: 300, height: 610, borderRadius: 52, padding: 12, background: "linear-gradient(160deg, #2A2C33, #121318)", boxShadow: "0 50px 100px rgba(0,0,0,.45), inset 0 0 0 1.5px rgba(255,255,255,.12)", flexShrink: 0 }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 42, overflow: "hidden", background: "#0E0F12" }}>
        <div style={{ position: "absolute", top: 10, left: "50%", marginLeft: -48, width: 96, height: 28, borderRadius: 20, background: "#000", zIndex: 5 }} />
        <div style={{ position: "absolute", top: 50, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 4 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mark size={26} surface="#0E0F12" people="#F2F2F5" /><span style={{ fontFamily: "var(--brand)", fontWeight: 600, fontSize: 18, color: "#F2F2F5" }}>room<span className="r8-iri-text" style={{ background: "var(--iri-v)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>8</span></span></span>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--iri)" }} />
        </div>
        <div style={{ position: "absolute", top: 92, left: 12, right: 12, bottom: 96 }}>
          <MiniCard c={card(i + 1)} back />
          <AnimatePresence initial={false} custom={dir}>
            <motion.div key={i} custom={dir} style={{ position: "absolute", inset: 0 }}
              initial={{ scale: 0.95, y: 10, opacity: 0.6 }} animate={{ scale: 1, y: 0, opacity: 1, x: 0, rotate: 0 }}
              exit={(d) => ({ x: d * 340, rotate: d * 18, opacity: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } })}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}>
              <MiniCard c={card(i)} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ position: "absolute", bottom: 26, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
          <span style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F2F2F5" }}><Icon name="x" size={20} stroke={2.4} /></span>
          <span style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--iri)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 26px rgba(217,139,255,.45)" }}><Icon name="heart" size={26} fill="#0E0F12" color="#0E0F12" /></span>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ c, back }) {
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 26, overflow: "hidden", background: "#17181D", border: "1px solid rgba(255,255,255,.1)", transform: back ? "scale(.95) translateY(10px)" : "none", opacity: back ? 0.6 : 1 }}>
      <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: c.a, filter: "blur(60px)", opacity: 0.55, top: 10, left: -50 }} />
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: c.b, filter: "blur(60px)", opacity: 0.5, top: 120, right: -70 }} />
      <svg viewBox="0 0 100 120" style={{ position: "absolute", left: "50%", top: 60, width: 150, marginLeft: -75, opacity: 0.32 }} aria-hidden="true">
        <circle cx="50" cy="38" r="22" fill="#fff" /><path d="M10 120c4-30 20-44 40-44s36 14 40 44z" fill="#fff" />
      </svg>
      <div className="r8-sticker" style={{ position: "absolute", top: 14, right: 14, padding: "6px 10px 5px" }}><b style={{ fontSize: 19 }}>{c.pct}%</b><small style={{ fontSize: 8.5 }}>MATCH</small></div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "60px 14px 14px", background: "linear-gradient(180deg, transparent, rgba(14,15,18,.92))", color: "#fff" }}>
        <p style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.03em" }}>{c.name}, <span style={{ fontWeight: 500, opacity: .85 }}>{c.age}</span></p>
        <p style={{ fontSize: 12, opacity: .75, marginBottom: 8 }}>{c.school}</p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {c.tags.map(([ic, t]) => <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 24, padding: "0 9px", borderRadius: 999, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", fontSize: 11 }}><Icon name={ic} size={12} />{t}</span>)}
        </div>
      </div>
    </div>
  );
}

function SignupCounter() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch(`${API_URL}/api/stats/public`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (alive) setStats(d); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!stats || stats.verified_students < COUNTER_MIN_TO_SHOW) return null;
  const updated = new Date(stats.updated_at + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <p className="r8-muted" style={{ fontSize: 15, marginTop: 18 }}>
      <b style={{ color: "var(--text)" }}>{stats.verified_students.toLocaleString()}</b> verified students from <b style={{ color: "var(--text)" }}>{stats.schools}</b> {stats.schools === 1 ? "campus" : "campuses"} already in.
      <span className="r8-faint" style={{ display: "block", fontSize: 12.5, marginTop: 2 }}>Updated {updated}</span>
    </p>
  );
}

function SectionTitle({ eyebrow, title, sub }) {
  return (
    <motion.div {...reveal} style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
      {eyebrow && <p className="r8-eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</p>}
      <h2 style={{ fontSize: "clamp(34px, 6vw, 56px)", lineHeight: 1.02, letterSpacing: "-0.04em" }}>{title}</h2>
      {sub && <p className="r8-muted" style={{ fontSize: 18, marginTop: 16, lineHeight: 1.55 }}>{sub}</p>}
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const start = () => navigate(user ? "/app" : "/register");
  const { scrollY } = useScroll();
  const phoneY = useTransform(scrollY, [0, 600], [0, -60]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    if (id.startsWith("faq-")) setOpenFaq(id);
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100dvh", display: "flex", alignItems: "center", padding: "calc(var(--safe-t) + 120px) 20px 80px" }}>
        <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 700, height: 700, top: -260, right: -220, opacity: .6 }} />
        <div aria-hidden="true" className="r8-aura r8-aura--b" style={{ width: 560, height: 560, bottom: -200, left: -240, opacity: .5 }} />
        <div className="r8-hero" style={{ position: "relative", maxWidth: 1120, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", alignItems: "center", gap: 56 }}>
          <div>
            <motion.span initial={{ opacity: 0, y: 10, rotate: -6 }} animate={{ opacity: 1, y: 0, rotate: -3 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="r8-sticker r8-sticker--pill" style={{ fontSize: 13.5, marginBottom: 26 }}>
              <Icon name="sparkle" size={14} stroke={2.2} />Early access is open. Free for students.
            </motion.span>
            <h1 style={{ fontSize: "clamp(56px, 11vw, 112px)", lineHeight: 0.92, letterSpacing: "-0.055em", fontWeight: 800 }}>
              <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.05 }} style={{ display: "block" }}>Find your </motion.span>
              <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.15 }} className="r8-iri-text" style={{ display: "block", paddingBottom: "0.06em" }}>people.</motion.span>
            </h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="r8-muted" style={{ fontSize: "clamp(18px, 2.4vw, 21px)", lineHeight: 1.5, maxWidth: 520, marginTop: 24 }}>
              The roommate matching app built for college students. Verified profiles, lifestyle compatibility, and real campus community.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 34 }}>
              <button className="r8-btn r8-btn--primary r8-btn--lg" onClick={start}>Get started free<Icon name="arrowRight" size={20} /></button>
              <a href="#how-it-works" className="r8-btn r8-btn--glass r8-btn--lg">See how it works</a>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="r8-faint" style={{ fontSize: 14.5, marginTop: 20, lineHeight: 1.5 }}>
              <Icon name="lock" size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />We never sell your data or share it with advertisers. <Link to="/privacy" style={{ textDecoration: "underline", color: "var(--text-2)" }}>Privacy policy</Link>
            </motion.p>
            <SignupCounter />
          </div>
          <motion.div style={{ y: phoneY, display: "flex", justifyContent: "center" }} initial={{ opacity: 0, rotate: 4 }} animate={{ opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.2 }}>
            <div aria-hidden="true" style={{ transform: "rotate(-3deg)" }}><HeroPhone /></div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ position: "relative", padding: "110px 20px", scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <SectionTitle eyebrow="How it works" title={<>Three steps. <span className="r8-iri-text">Zero randoms.</span></>} sub="No housing office emails, no awkward Facebook group posts. Just people from your school who live like you do." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="r8-card" style={{ padding: 28, borderRadius: 30, position: "relative", overflow: "hidden" }}>
                <span aria-hidden="true" style={{ position: "absolute", right: 18, top: 6, fontFamily: "var(--display)", fontWeight: 800, fontSize: 96, letterSpacing: "-0.06em", opacity: 0.07 }}>{i + 1}</span>
                <span style={{ width: 52, height: 52, borderRadius: 17, background: "var(--iri)", color: "#0E0F12", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, boxShadow: "var(--glow)" }}><Icon name={s.icon} size={24} stroke={2} /></span>
                <h3 style={{ fontSize: 23, marginBottom: 10 }}>{s.title}</h3>
                <p className="r8-muted" style={{ fontSize: 16, lineHeight: 1.55 }}>{s.body}</p>
              </motion.div>
            ))}
          </div>
          <motion.div {...reveal} style={{ textAlign: "center", marginTop: 40 }}>
            <button className="r8-btn r8-btn--solid r8-btn--lg" onClick={start}>Find your roommate<Icon name="arrowRight" size={20} /></button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section style={{ position: "relative", padding: "60px 20px 110px" }}>
        <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 520, height: 520, top: 100, left: "40%" }} />
        <div style={{ position: "relative", maxWidth: 1120, margin: "0 auto" }}>
          <SectionTitle eyebrow="Built for how students live" title="Everything a roommate search should've been." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <motion.article {...reveal} className="r8-card" style={{ padding: 30, borderRadius: 32 }}>
              <span className="r8-badge r8-badge--iri" style={{ marginBottom: 18 }}><Icon name="school" size={14} />Campus only</span>
              <h3 style={{ fontSize: 28, marginBottom: 12 }}>School verified</h3>
              <p className="r8-muted" style={{ fontSize: 16, lineHeight: 1.55 }}>Verify with your .edu email. We send a quick confirmation and you're in. No student ID uploads, no paperwork.</p>
              <a href="#faq-verification" onClick={() => setOpenFaq("faq-verification")} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, fontWeight: 600, color: "var(--peri)" }}>How verification works<Icon name="arrowRight" size={16} /></a>
            </motion.article>
            <motion.article {...reveal} transition={{ ...reveal.transition, delay: 0.06 }} className="r8-card" style={{ padding: 30, borderRadius: 32 }}>
              <span className="r8-badge r8-badge--iri" style={{ marginBottom: 18 }}><Icon name="sliders" size={14} />Real compatibility</span>
              <h3 style={{ fontSize: 28, marginBottom: 12 }}>Matched on how you live</h3>
              <p className="r8-muted" style={{ fontSize: 16, lineHeight: 1.55, marginBottom: 18 }}>Sleep schedule, study habits, cleanliness and noise. The stuff that actually matters when you share a space.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[["moon", "Night owl"], ["sun", "Early bird"], ["sparkle", "Spotless"], ["quiet", "Likes it quiet"], ["book", "Library"], ["users", "Social"]].map(([ic, t], k) => (
                  <motion.span key={t} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 + k * 0.05, type: "spring", stiffness: 400, damping: 18 }} className="r8-chip"><Icon name={ic} size={15} />{t}</motion.span>
                ))}
              </div>
            </motion.article>
            <motion.article {...reveal} transition={{ ...reveal.transition, delay: 0.12 }} className="r8-card" style={{ padding: 30, borderRadius: 32 }}>
              <span className="r8-badge r8-badge--iri" style={{ marginBottom: 18 }}><Icon name="shield" size={14} />Safety first</span>
              <h3 style={{ fontSize: 28, marginBottom: 12 }}>Built-in safety</h3>
              <p className="r8-muted" style={{ fontSize: 16, lineHeight: 1.55 }}>Photo verification reviewed by a real person, plus reporting and blocking on every profile and chat.</p>
            </motion.article>
            <motion.article {...reveal} transition={{ ...reveal.transition, delay: 0.18 }} className="r8-card" style={{ padding: 30, borderRadius: 32 }}>
              <span className="r8-badge r8-badge--iri" style={{ marginBottom: 18 }}><Icon name="chat" size={14} />Real time</span>
              <h3 style={{ fontSize: 28, marginBottom: 16 }}>Match, then talk</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[["them", "hiii saw you're an early bird too"], ["me", "yes!! 6am gym girl here"], ["them", "ok we're living together"]].map(([who, t], k) => (
                  <motion.span key={t} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + k * 0.25 }}
                    style={{ alignSelf: who === "me" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "9px 14px", borderRadius: 20, fontSize: 14.5, ...(who === "me" ? { background: "linear-gradient(135deg, #6F8BFF, #B07CFF)", color: "#fff", borderBottomRightRadius: 6 } : { background: "var(--elev-2)", border: "1px solid var(--line)", borderBottomLeftRadius: 6 }) }}>{t}</motion.span>
                ))}
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Testimonials (real only) */}
      {TESTIMONIALS.length >= TESTIMONIALS_MIN_TO_SHOW && (
        <section style={{ padding: "60px 20px 110px" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <SectionTitle eyebrow="From the beta" title="What students are saying" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {TESTIMONIALS.slice(0, 6).map((t, i) => (
                <motion.figure key={t.name} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="r8-card" style={{ margin: 0, padding: 26, borderRadius: 28, display: "flex", flexDirection: "column", gap: 18 }}>
                  <blockquote style={{ margin: 0, fontSize: 18, lineHeight: 1.5, fontFamily: "var(--display)", fontWeight: 500, letterSpacing: "-0.01em", flex: 1 }}>"{t.quote}"</blockquote>
                  <figcaption style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar src={t.photo} name={t.name} size={44} />
                    <span><b style={{ display: "block", fontSize: 15 }}>{t.name}</b><span className="r8-faint" style={{ fontSize: 13.5 }}>{[t.year, t.school].filter(Boolean).join(", ")}</span></span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Status */}
      <section style={{ padding: "40px 20px 110px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <SectionTitle eyebrow="Where we're at" title="Early, on purpose." sub="We open campuses as they fill up, so the first time you swipe there are real people from your school on the other side." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[["sparkle", "Early access open now", "Sign up free with your .edu email"], ["key", "Campus pilots next", "First campus pilots start this spring"], ["school", "Built for students", "Free, always"], ["users", "Seeking partners", "Housing offices welcome"]].map(([ic, t, d], i) => (
              <motion.div key={t} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="r8-card" style={{ padding: 22, borderRadius: 24, display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ width: 44, height: 44, borderRadius: 14, background: "var(--iri-soft)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={ic} size={21} /></span>
                <span><b style={{ display: "block", fontSize: 16 }}>{t}</b><span className="r8-muted" style={{ fontSize: 14 }}>{d}</span></span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For universities */}
      <section style={{ padding: "0 20px 110px" }}>
        <motion.div {...reveal} style={{ maxWidth: 1120, margin: "0 auto", borderRadius: 40, padding: "clamp(32px, 6vw, 64px)", position: "relative", overflow: "hidden", background: "#0E0F12", color: "#F2F2F5", border: "1px solid rgba(255,255,255,.1)" }}>
          <div aria-hidden="true" style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", background: "conic-gradient(from 90deg, #45D9FF, #8C9EFF, #D98BFF, #FF5FA0, #45D9FF)", filter: "blur(100px)", opacity: .45, right: -160, top: -200 }} />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40, alignItems: "center" }}>
            <div>
              <p className="r8-eyebrow" style={{ color: "rgba(242,242,245,.55)", marginBottom: 14 }}>For universities</p>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.04, color: "#F2F2F5" }}>Give your students a better first roommate.</h2>
              <p style={{ fontSize: 17, lineHeight: 1.55, marginTop: 16, color: "rgba(242,242,245,.7)" }}>Students verify with their school email, match on lifestyle, and can confirm roommates straight to your housing office.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26 }}>
                <a href="mailto:partner@room8app.com" className="r8-btn r8-btn--primary">Contact us<Icon name="arrowRight" size={18} /></a>
                <Link to="/schools" className="r8-btn" style={{ color: "#F2F2F5", border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.06)" }}>Learn more</Link>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              {[["school", "Verified students", "School email confirmation"], ["shield", "Safety tools", "Reporting, blocking, moderation"], ["grid", "Housing insights", "Aggregate preference data"], ["users", "Real support", "Hands-on onboarding"]].map(([ic, t, d]) => (
                <div key={t} style={{ padding: 18, borderRadius: 22, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                  <Icon name={ic} size={22} />
                  <b style={{ display: "block", marginTop: 12, fontSize: 15.5 }}>{t}</b>
                  <span style={{ fontSize: 13.5, color: "rgba(242,242,245,.6)" }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Founders */}
      <section id="about" style={{ padding: "40px 20px 110px", scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <SectionTitle eyebrow="Who's behind Room8" title="Built by students who've been there." sub="Room8 started as a student project at The Evergreen State College in 2024. We're two co-founders building it for students like us." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {FOUNDERS.map((f, i) => (
              <motion.div key={f.name} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="r8-card" style={{ padding: 24, borderRadius: 28, display: "flex", gap: 18, alignItems: "flex-start" }}>
                <Avatar src={f.photo} name={f.name} size={76} ring />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em" }}>{f.name}</p>
                  <p className="r8-muted" style={{ fontSize: 14.5 }}>{f.role}, {f.school}</p>
                  {f.story && <p style={{ fontSize: 15, lineHeight: 1.55, marginTop: 12 }}>{f.story}</p>}
                  {f.links.filter((l) => l.href).length > 0 && (
                    <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
                      {f.links.filter((l) => l.href).map((l) => <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--peri)", display: "inline-flex", alignItems: "center", gap: 4 }}>{l.label}<Icon name="arrowRight" size={14} /></a>)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: "40px 20px 110px", scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <SectionTitle title="Questions students ask" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((f) => {
              const open = openFaq === f.id;
              return (
                <div key={f.id} id={f.id} className="r8-card" style={{ borderRadius: 22, overflow: "hidden", scrollMarginTop: 100 }}>
                  <button onClick={() => setOpenFaq(open ? null : f.id)} aria-expanded={open} aria-controls={`${f.id}-a`}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 22px", textAlign: "left", fontFamily: "var(--display)", fontWeight: 600, fontSize: 18, letterSpacing: "-0.015em" }}>
                    {f.q}
                    <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 24 }} style={{ width: 34, height: 34, borderRadius: "50%", background: open ? "var(--iri)" : "var(--glass-2)", color: open ? "#0E0F12" : "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="plus" size={18} stroke={2.2} /></motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div id={`${f.id}-a`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 32 }} style={{ overflow: "hidden" }}>
                        <p className="r8-muted" style={{ padding: "0 22px 22px", fontSize: 16, lineHeight: 1.6 }}>
                          {f.a} {f.link && <Link to={f.link.to} style={{ color: "var(--text)", fontWeight: 600, textDecoration: "underline" }}>{f.link.label}</Link>}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ position: "relative", padding: "80px 20px 140px", textAlign: "center", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", width: 640, height: 640, left: "50%", top: "50%", marginLeft: -320, marginTop: -320, borderRadius: "50%", background: "conic-gradient(from 0deg, #45D9FF, #8C9EFF, #D98BFF, #FF5FA0, #45D9FF)", filter: "blur(120px)", opacity: .28 }} />
        <motion.div {...reveal} style={{ position: "relative", maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Mark size={72} />
          <h2 style={{ fontSize: "clamp(40px, 7vw, 72px)", lineHeight: 1, letterSpacing: "-0.045em", marginTop: 24 }}>Stop leaving it <span className="r8-iri-text">to chance.</span></h2>
          <p className="r8-muted" style={{ fontSize: 18, marginTop: 18, maxWidth: 520 }}>Be one of the first students to use Room8 at your school. Free early access, open now.</p>
          <button className="r8-btn r8-btn--primary r8-btn--lg" onClick={start} style={{ marginTop: 32 }}>Get early access<Icon name="arrowRight" size={20} /></button>
          {!user && <Link to="/login" className="r8-btn r8-btn--ghost" style={{ marginTop: 10 }}>I already have an account</Link>}
        </motion.div>
      </section>

      <style>{`@media (min-width: 900px) { .r8-hero { grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr) !important; } }`}</style>
    </div>
  );
}
