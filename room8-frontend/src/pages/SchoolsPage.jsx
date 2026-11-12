// src/pages/SchoolsPage.jsx: university and housing office pitch
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Icon from "../ui/Icon";

const reveal = { initial: { opacity: 0.35, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { type: "spring", stiffness: 160, damping: 24 } };
const wrap = { maxWidth: 1080, margin: "0 auto" };

const PROBLEMS = [
  { icon: "shuffle", title: "Random pairing", body: "Housing forms ask a few questions, then students find out about the 3am alarms after move-in." },
  { icon: "chat", title: "Conflict lands on staff", body: "Mismatches turn into room change requests, RA mediation and unhappy first semesters." },
  { icon: "clock", title: "Students search alone", body: "Facebook groups and group chats are slow, unverified and open to anyone." },
];

const STEPS = [
  { n: "01", icon: "school", title: "We set up your campus", body: "A verified campus space tied to your official email domain, so only enrolled students can join." },
  { n: "02", icon: "link", title: "Students join for free", body: "Share one signup link. Students build profiles, answer lifestyle questions and meet verified classmates at no cost." },
  { n: "03", icon: "chart", title: "You get insights", body: "Aggregate, anonymized data on housing preferences and engagement to inform housing decisions." },
];

const SOLUTION = [
  { icon: "sliders", title: "Deep lifestyle compatibility", body: "Sleep, cleanliness, study habits, noise, guests and social energy. Not just interests." },
  { icon: "check", title: "School verified only", body: "Email domain verification keeps your campus pool closed to non students." },
  { icon: "shield", title: "Built in safety tools", body: "Report, block and human moderation on every profile and chat." },
  { icon: "chart", title: "Housing insights", body: "Anonymized trends your housing office can actually use." },
];

const PRICING = [
  { tier: "Free pilot", price: "$0", period: "6 month trial", desc: "Test Room8 with a cohort of students before committing.", features: ["Up to 200 students", "School verified profiles", "Full swipe and matching", "Basic insights dashboard", "Email support"], cta: "Apply for pilot" },
  { tier: "Standard", price: "$5,000", period: "per year", desc: "Full deployment and ongoing partnership for mid size schools.", features: ["Unlimited students", "Full compatibility engine", "Advanced insights dashboard", "Housing office admin portal", "Priority support and onboarding", "Co branded welcome materials"], cta: "Get started", highlight: true },
  { tier: "Enterprise", price: "$15,000", period: "per year", desc: "Large universities or multi campus systems that need deep integration.", features: ["Everything in Standard", "Multi campus support", "Custom data integrations", "White label option", "Dedicated account manager", "SLA and compliance documentation"], cta: "Contact us" },
];

const SIZES = [["under_2k", "Under 2,000"], ["2k_5k", "2,000 to 5,000"], ["5k_15k", "5,000 to 15,000"], ["15k_30k", "15,000 to 30,000"], ["over_30k", "Over 30,000"]];

function Head({ eyebrow, title, sub, center = true }) {
  return (
    <motion.div {...reveal} style={{ textAlign: center ? "center" : "left", marginBottom: 40 }}>
      <p className="r8-eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</p>
      <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.05 }}>{title}</h2>
      {sub && <p className="r8-muted" style={{ fontSize: 18, maxWidth: 560, margin: center ? "16px auto 0" : "16px 0 0", lineHeight: 1.5 }}>{sub}</p>}
    </motion.div>
  );
}

function IconTile({ name }) {
  return <span style={{ width: 48, height: 48, borderRadius: 16, background: "var(--iri)", color: "#0E0F12", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={name} size={22} stroke={2} /></span>;
}

export default function SchoolsPage() {
  const [form, setForm] = useState({ name: "", title: "", business: "", email: "", students: "", message: "" });
  const [status, setStatus] = useState("");
  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.business || !form.email) return;
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/xkoyqbjv", { method: "POST", headers: { Accept: "application/json" }, body: new FormData(e.target) });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Hero */}
      <section style={{ position: "relative", padding: "calc(var(--safe-t) + 132px) 20px 96px", textAlign: "center" }}>
        <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 640, height: 640, top: -260, left: "50%", marginLeft: -320 }} />
        <div style={{ position: "relative", ...wrap }}>
          <span className="r8-sticker r8-sticker--pill" style={{ marginBottom: 22 }}><Icon name="school" size={15} />For universities and housing offices</span>
          <h1 style={{ fontSize: "clamp(44px, 8.5vw, 92px)", lineHeight: 0.95, letterSpacing: "-0.05em", maxWidth: 900, margin: "0 auto" }}>
            Better roommates. <span className="r8-iri-text">Happier students.</span>
          </h1>
          <p className="r8-muted" style={{ fontSize: 20, maxWidth: 620, margin: "26px auto 0", lineHeight: 1.5 }}>
            Room8 brings school verified, lifestyle matched roommate pairing to your campus so fewer first semesters start with a conflict.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 34 }}>
            <a href="#contact" className="r8-btn r8-btn--primary r8-btn--lg">Request a demo<Icon name="arrowRight" size={20} /></a>
            <a href="#pricing" className="r8-btn r8-btn--glass r8-btn--lg">View pricing</a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={{ padding: "40px 20px 100px" }}>
        <div style={wrap}>
          <Head eyebrow="The problem" title="Roommate matching hasn't changed in decades." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {PROBLEMS.map((p, i) => (
              <motion.div key={p.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="r8-card" style={{ padding: 28, borderRadius: 30 }}>
                <IconTile name={p.icon} />
                <h3 style={{ fontSize: 21, margin: "18px 0 8px" }}>{p.title}</h3>
                <p className="r8-muted" style={{ fontSize: 16, lineHeight: 1.55 }}>{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section style={{ padding: "0 20px 100px" }}>
        <div style={{ ...wrap, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 40, alignItems: "center" }}>
          <motion.div {...reveal}>
            <p className="r8-eyebrow" style={{ marginBottom: 14 }}>Our solution</p>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.05 }}>Matching built around how students actually live.</h2>
            <p className="r8-muted" style={{ fontSize: 18, lineHeight: 1.6, marginTop: 18 }}>
              Students answer quick lifestyle questions, see a compatibility score with the reasons behind it, and talk before they decide. Your team gets a calmer move in and the data to plan the next one.
            </p>
          </motion.div>
          <div style={{ display: "grid", gap: 12 }}>
            {SOLUTION.map((s, i) => (
              <motion.div key={s.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="r8-glass" style={{ display: "flex", gap: 16, padding: 18, borderRadius: 24, alignItems: "center" }}>
                <IconTile name={s.icon} />
                <div>
                  <h3 style={{ fontSize: 17, marginBottom: 3 }}>{s.title}</h3>
                  <p className="r8-muted" style={{ fontSize: 15, lineHeight: 1.45 }}>{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "0 20px 100px" }}>
        <div style={wrap}>
          <Head eyebrow="How it works" title="Live on your campus in three steps." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.n} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="r8-card" style={{ padding: 28, borderRadius: 30, position: "relative" }}>
                <span className="r8-iri-text" style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 44, lineHeight: 1 }}>{s.n}</span>
                <h3 style={{ fontSize: 21, margin: "18px 0 8px", display: "flex", alignItems: "center", gap: 10 }}><Icon name={s.icon} size={20} />{s.title}</h3>
                <p className="r8-muted" style={{ fontSize: 16, lineHeight: 1.55 }}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "0 20px 100px", scrollMarginTop: 100 }}>
        <div style={wrap}>
          <Head eyebrow="Pricing" title="Start free. Scale when you're ready." sub="No per student charges after the pilot. Custom contracts available for public universities." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "stretch" }}>
            {PRICING.map((p, i) => (
              <motion.div key={p.tier} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}
                className={p.highlight ? "r8-glass" : "r8-card"}
                style={{ padding: 30, borderRadius: 32, display: "flex", flexDirection: "column", position: "relative", ...(p.highlight ? { boxShadow: "0 0 0 1.5px var(--accent), var(--shadow-lg)" } : null) }}>
                {p.highlight && <span className="r8-sticker r8-sticker--pill" style={{ position: "absolute", top: -14, right: 22 }}>Most popular</span>}
                <p className="r8-eyebrow">{p.tier}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "14px 0 6px" }}>
                  <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 46, letterSpacing: "-0.04em" }}>{p.price}</span>
                  <span className="r8-muted" style={{ fontSize: 15 }}>{p.period}</span>
                </div>
                <p className="r8-muted" style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 22 }}>{p.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 26px", display: "grid", gap: 11, flex: 1 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15 }}>
                      <span style={{ color: "var(--accent)", display: "flex" }}><Icon name="check" size={17} stroke={2.4} /></span>{f}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className={`r8-btn ${p.highlight ? "r8-btn--primary" : "r8-btn--glass"}`} style={{ width: "100%" }}>{p.cta}</a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" style={{ padding: "0 20px 120px", scrollMarginTop: 100 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Head eyebrow="Get in touch" title="Bring Room8 to your campus." sub="Tell us a little about your school and we'll reach out within two business days." />
          <motion.div {...reveal} className="r8-card" style={{ padding: "clamp(22px, 5vw, 40px)", borderRadius: 34 }}>
            {status === "sent" ? (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <span style={{ width: 64, height: 64, borderRadius: 22, background: "var(--iri)", color: "#0E0F12", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={30} stroke={2.4} /></span>
                <h3 style={{ fontSize: 26, marginTop: 18 }}>Inquiry sent</h3>
                <p className="r8-muted" style={{ marginTop: 8 }}>Thanks. We'll be in touch within two business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
                <div className="r8-form-2">
                  <label className="r8-field"><span>Full name *</span><input className="r8-input" name="name" value={form.name} onChange={update} required placeholder="Dr. Jane Smith" /></label>
                  <label className="r8-field"><span>Title</span><input className="r8-input" name="title" value={form.title} onChange={update} placeholder="Director of Residential Life" /></label>
                </div>
                <label className="r8-field"><span>Institution *</span><input className="r8-input" name="business" value={form.business} onChange={update} required placeholder="University of Example" /></label>
                <div className="r8-form-2">
                  <label className="r8-field"><span>Work email *</span><input className="r8-input" name="email" type="email" value={form.email} onChange={update} required placeholder="jsmith@university.edu" /></label>
                  <label className="r8-field"><span>Enrolled students</span>
                    <select className="r8-select" name="students" value={form.students} onChange={update}>
                      <option value="">Select a range</option>
                      {SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </label>
                </div>
                <label className="r8-field"><span>Anything we should know?</span><textarea className="r8-textarea" name="message" value={form.message} onChange={update} rows={4} placeholder="Timeline, housing setup, questions" /></label>
                {status === "error" && <p role="alert" style={{ color: "var(--danger)", fontSize: 14 }}>That didn't send. Try again or email partner@room8app.com.</p>}
                <button type="submit" className="r8-btn r8-btn--primary r8-btn--lg" disabled={status === "sending"}>{status === "sending" ? "Sending" : "Send inquiry"}<Icon name="arrowRight" size={20} /></button>
                <p className="r8-muted" style={{ fontSize: 14, textAlign: "center" }}>Or email <a href="mailto:partner@room8app.com" style={{ color: "var(--accent)" }}>partner@room8app.com</a></p>
              </form>
            )}
          </motion.div>
          <p className="r8-muted" style={{ textAlign: "center", marginTop: 28, fontSize: 15 }}>Not a school? <Link to="/" style={{ color: "var(--accent)" }}>Back to Room8</Link></p>
        </div>
      </section>

      <style>{`
        .r8-form-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .r8-field { display: grid; gap: 7px; }
        .r8-field > span { font-size: 13px; font-weight: 600; color: var(--text-2); }
        @media (max-width: 620px) { .r8-form-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
